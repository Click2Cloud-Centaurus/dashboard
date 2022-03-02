// Copyright 2017 The Kubernetes Authors.
// Copyright 2020 Authors of Arktos - file modified.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"crypto/elliptic"
	"crypto/tls"
	"encoding/base64"
	"errors"
	"flag"
	"fmt"
	"github.com/kubernetes/dashboard/src/app/backend/iam"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/tools/cache"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/kubernetes/dashboard/src/app/backend/iam/db"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/spf13/pflag"

	"github.com/kubernetes/dashboard/src/app/backend/args"
	"github.com/kubernetes/dashboard/src/app/backend/auth"
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"github.com/kubernetes/dashboard/src/app/backend/auth/jwe"
	"github.com/kubernetes/dashboard/src/app/backend/cert"
	"github.com/kubernetes/dashboard/src/app/backend/cert/ecdsa"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	"github.com/kubernetes/dashboard/src/app/backend/handler"
	"github.com/kubernetes/dashboard/src/app/backend/integration"
	integrationapi "github.com/kubernetes/dashboard/src/app/backend/integration/api"
	"github.com/kubernetes/dashboard/src/app/backend/settings"
	"github.com/kubernetes/dashboard/src/app/backend/sync"
	"github.com/kubernetes/dashboard/src/app/backend/systembanner"
)

var (
	defaultKubeconfig      = os.Getenv("DEFAULT_KUBECONFIG")
	argInsecurePort        = pflag.Int("insecure-port", 9090, "The port to listen to for incoming HTTP requests.")
	argPort                = pflag.Int("port", 8443, "The secure port to listen to for incoming HTTPS requests.")
	argInsecureBindAddress = pflag.IP("insecure-bind-address", net.IPv4(127, 0, 0, 1), "The IP address on which to serve the --insecure-port (set to 127.0.0.1 for all interfaces).")
	argBindAddress         = pflag.IP("bind-address", net.IPv4(0, 0, 0, 0), "The IP address on which to serve the --port (set to 0.0.0.0 for all interfaces).")
	argDefaultCertDir      = pflag.String("default-cert-dir", "/certs", "Directory path containing '--tls-cert-file' and '--tls-key-file' files. Used also when auto-generating certificates flag is set.")
	argCertFile            = pflag.String("tls-cert-file", "", "File containing the default x509 Certificate for HTTPS.")
	argKeyFile             = pflag.String("tls-key-file", "", "File containing the default x509 private key matching --tls-cert-file.")
	argApiserverHost       = pflag.String("apiserver-host", "", "The address of the Kubernetes Apiserver "+
		"to connect to in the format of protocol://address:port, e.g., "+
		"http://localhost:8080. If not specified, the assumption is that the binary runs inside a "+
		"Kubernetes cluster and local discovery is attempted.")
	argMetricsProvider = pflag.String("metrics-provider", "none", "Select provider type for metrics. 'none' will not check metrics.")
	argHeapsterHost    = pflag.String("heapster-host", "", "The address of the Heapster Apiserver "+
		"to connect to in the format of protocol://address:port, e.g., "+
		"http://localhost:8082. If not specified, the assumption is that the binary runs inside a "+
		"Kubernetes cluster and service proxy will be used.")
	argSidecarHost = pflag.String("sidecar-host", "", "The address of the Sidecar Apiserver "+
		"to connect to in the format of protocol://address:port, e.g., "+
		"http://localhost:8000. If not specified, the assumption is that the binary runs inside a "+
		"Kubernetes cluster and service proxy will be used.")
	argKubeConfigFile     = pflag.String("kubeconfig", defaultKubeconfig, "Path to kubeconfig file with authorization and master location information.")
	argTokenTTL           = pflag.Int("token-ttl", int(authApi.DefaultTokenTTL), "Expiration time (in seconds) of JWE tokens generated by dashboard. '0' never expires")
	argAuthenticationMode = pflag.StringSlice("authentication-mode", []string{authApi.Token.String()}, "Enables authentication options that will be reflected on login screen. Supported values: token, basic. "+
		"Note that basic option should only be used if apiserver has '--authorization-mode=ABAC' and '--basic-auth-file' flags set.")
	argMetricClientCheckPeriod   = pflag.Int("metric-client-check-period", 30, "Time in seconds that defines how often configured metric client health check should be run.")
	argAutoGenerateCertificates  = pflag.Bool("auto-generate-certificates", false, "When set to true, Dashboard will automatically generate certificates used to serve HTTPS. (default false)")
	argEnableInsecureLogin       = pflag.Bool("enable-insecure-login", false, "When enabled, Dashboard login view will also be shown when Dashboard is not served over HTTPS. (default false)")
	argEnableSkip                = pflag.Bool("enable-skip-login", false, "When enabled, the skip button on the login page will be shown. (default false)")
	argSystemBanner              = pflag.String("system-banner", "", "When non-empty displays message to Dashboard users. Accepts simple HTML tags.")
	argSystemBannerSeverity      = pflag.String("system-banner-severity", "INFO", "Severity of system banner. Should be one of 'INFO|WARNING|ERROR'.")
	argAPILogLevel               = pflag.String("api-log-level", "INFO", "Level of API request logging. Should be one of 'INFO|NONE|DEBUG'.")
	argDisableSettingsAuthorizer = pflag.Bool("disable-settings-authorizer", false, "When enabled, Dashboard settings page will not require user to be logged in and authorized to access settings page. (default false)")
	argNamespace                 = pflag.String("namespace", getEnv("POD_NAMESPACE", "kube-system"), "When non-default namespace is used, create encryption key in the specified namespace.")
	localeConfig                 = pflag.String("locale-config", "./locale_conf.json", "File containing the configuration of locales")
)

const TENANTPARTITION = "TP"
const RESOURCEPARTITION = "RP"

func main() {
	// Set logging output to standard console out
	log.SetOutput(os.Stdout)

	pflag.CommandLine.AddGoFlagSet(flag.CommandLine)
	pflag.Parse()
	_ = flag.CommandLine.Parse(make([]string, 0)) // Init for glog calls in kubernetes packages

	// Initializes dashboard arguments holder so we can read them in other packages
	initArgHolder()
	if args.Holder.GetApiServerHost() != "" {
		log.Printf("Using apiserver-host location: %s", args.Holder.GetApiServerHost())
	}
	if args.Holder.GetKubeConfigFile() != "" {
		log.Printf("Using kubeconfig file: %s", args.Holder.GetKubeConfigFile())
	}
	if args.Holder.GetNamespace() != "" {
		log.Printf("Using namespace: %s", args.Holder.GetNamespace())
	}
	log.Printf("Using locale config: %s", *localeConfig)
	configs, err := CreateOrConfigureKubeconfig()
	if err != nil {
		log.Printf("No RPs & TPs config files found")
		//TODO chceck
	}
	var tpclients []clientapi.ClientManager
	var rpclients []clientapi.ClientManager
	var tppodinformer []cache.SharedIndexInformer
	var tpclientmaps = make(map[string]clientapi.ClientManager)

	clientManager := client.NewClientManager(args.Holder.GetKubeConfigFile(), args.Holder.GetApiServerHost())
	versionInfo, err := clientManager.InsecureClient().Discovery().ServerVersion()
	if err != nil {
		log.Printf("Failed to get server version: %v", err)
		handleFatalInitError(err)
	}

	log.Printf("Running in Kubernetes cluster version v%v.%v (%v)", versionInfo.Major, versionInfo.Minor, versionInfo.GitVersion)

	for name, _ := range configs {
		log.Printf("adding client for %s", name)
		newclientmanager := client.NewClientManager(configs[name], args.Holder.GetApiServerHost())
		if strings.Contains(name, strings.ToLower(RESOURCEPARTITION)) {
			//For rpconfigs
			rpclients = append(rpclients, newclientmanager)
		} else if strings.Contains(name, strings.ToLower(TENANTPARTITION)) {
			sharedoption := informers.WithNamespaceWithMultiTenancy("", "all")
			informerfactory := informers.NewSharedInformerFactoryWithOptions(newclientmanager.InsecureClient(), 1*time.Minute, sharedoption)
			podinformer := informerfactory.Core().V1().Pods().Informer()
			stopch := make(chan struct{})
			informerfactory.Start(stopch)
			informerfactory.WaitForCacheSync(stopch)
			tppodinformer = append(tppodinformer, podinformer)
			//clients = append(clients, newclientmanager)
			configname := strings.Split(name, ".")[1]
			tpclientmaps[configname] = newclientmanager
			tpclients = append(tpclients, newclientmanager)
		}
	}

	log.Printf("Successful initial request to the apiserver, version: %s", versionInfo.String())

	// Create table in Postgres Database
	CreateTable()
	error := iam.CreateClusterAdmin()
	if err != nil {
		log.Printf("Failed to create admin user: %s \n", error.Error())
	}
	//var tpauthmaps = make(map[string]authApi.AuthManager)
	// Init auth manager
	authManager := initAuthManager(clientManager)
	tpauthManagers := initAuthManager2(tpclientmaps)
	fmt.Printf("tpauthmgrsss %v", tpauthManagers)
	// Init settings manager
	settingsManager := settings.NewSettingsManager()

	// Init system banner manager
	systemBannerManager := systembanner.NewSystemBannerManager(args.Holder.GetSystemBanner(),
		args.Holder.GetSystemBannerSeverity())

	// Init integrations
	integrationManager := integration.NewIntegrationManager(clientManager)

	switch metricsProvider := args.Holder.GetMetricsProvider(); metricsProvider {
	case "sidecar":
		integrationManager.Metric().ConfigureSidecar(args.Holder.GetSidecarHost()).
			EnableWithRetry(integrationapi.SidecarIntegrationID, time.Duration(args.Holder.GetMetricClientCheckPeriod()))
	case "heapster":
		integrationManager.Metric().ConfigureHeapster(args.Holder.GetHeapsterHost()).
			EnableWithRetry(integrationapi.HeapsterIntegrationID, time.Duration(args.Holder.GetMetricClientCheckPeriod()))
	case "none":
		log.Print("no metrics provider selected, will not check metrics.")
	default:
		log.Printf("Invalid metrics provider selected: %s", metricsProvider)
		log.Print("Defaulting to use the Sidecar provider.")
		integrationManager.Metric().ConfigureSidecar(args.Holder.GetSidecarHost()).
			EnableWithRetry(integrationapi.SidecarIntegrationID, time.Duration(args.Holder.GetMetricClientCheckPeriod()))
	}

	apiHandler, err := handler.CreateHTTPAPIHandler(
		integrationManager,
		clientManager,
		tpclients,
		rpclients,
		authManager,
		settingsManager,
		tpclientmaps,
		tpauthManagers,
		systemBannerManager,
		tppodinformer)
	if err != nil {
		handleFatalInitError(err)
	}

	var servingCerts []tls.Certificate
	if args.Holder.GetAutoGenerateCertificates() {
		log.Println("Auto-generating certificates")
		certCreator := ecdsa.NewECDSACreator(args.Holder.GetKeyFile(), args.Holder.GetCertFile(), elliptic.P256())
		certManager := cert.NewCertManager(certCreator, args.Holder.GetDefaultCertDir())
		servingCert, err := certManager.GetCertificates()
		if err != nil {
			handleFatalInitServingCertError(err)
		}
		servingCerts = []tls.Certificate{servingCert}
	} else if args.Holder.GetCertFile() != "" && args.Holder.GetKeyFile() != "" {
		certFilePath := args.Holder.GetDefaultCertDir() + string(os.PathSeparator) + args.Holder.GetCertFile()
		keyFilePath := args.Holder.GetDefaultCertDir() + string(os.PathSeparator) + args.Holder.GetKeyFile()
		servingCert, err := tls.LoadX509KeyPair(certFilePath, keyFilePath)
		if err != nil {
			handleFatalInitServingCertError(err)
		}
		servingCerts = []tls.Certificate{servingCert}
	}

	// Run a HTTP server that serves static public files from './public' and handles API calls.
	http.Handle("/", handler.MakeGzipHandler(handler.CreateLocaleHandler()))
	http.Handle("/api/", apiHandler)
	http.Handle("/config", handler.AppHandler(handler.ConfigHandler))
	http.Handle("/api/sockjs/", handler.CreateAttachHandler("/api/sockjs"))
	// TODO: something triggered this change, look into it
	http.Handle("/metrics", promhttp.Handler())

	// Listen for http or https
	if servingCerts != nil {
		log.Printf("Serving securely on HTTPS port: %d", args.Holder.GetPort())
		secureAddr := fmt.Sprintf("%s:%d", args.Holder.GetBindAddress(), args.Holder.GetPort())
		server := &http.Server{
			Addr:      secureAddr,
			Handler:   http.DefaultServeMux,
			TLSConfig: &tls.Config{Certificates: servingCerts},
		}
		go func() { log.Fatal(server.ListenAndServeTLS("", "")) }()
	} else {
		log.Printf("Serving insecurely on HTTP port: %d", args.Holder.GetInsecurePort())
		addr := fmt.Sprintf("%s:%d", args.Holder.GetInsecureBindAddress(), args.Holder.GetInsecurePort())
		go func() { log.Fatal(http.ListenAndServe(addr, nil)) }()
	}
	select {}
}

func initAuthManager(clientManager clientapi.ClientManager) authApi.AuthManager {
	insecureClient := clientManager.InsecureClient()

	// Init default encryption key synchronizer
	synchronizerManager := sync.NewSynchronizerManager(insecureClient)
	keySynchronizer := synchronizerManager.Secret(args.Holder.GetNamespace(), authApi.EncryptionKeyHolderName)

	// Register synchronizer. Overwatch will be responsible for restarting it in case of error.
	sync.Overwatch.RegisterSynchronizer(keySynchronizer, sync.AlwaysRestart)

	// Init encryption key holder and token manager
	keyHolder := jwe.NewRSAKeyHolder(keySynchronizer)
	tokenManager := jwe.NewJWETokenManager(keyHolder)
	tokenTTL := time.Duration(args.Holder.GetTokenTTL())
	if tokenTTL != authApi.DefaultTokenTTL {
		tokenManager.SetTokenTTL(tokenTTL)
	}

	// Set token manager for client manager.
	clientManager.SetTokenManager(tokenManager)
	authModes := authApi.ToAuthenticationModes(args.Holder.GetAuthenticationMode())
	if len(authModes) == 0 {
		authModes.Add(authApi.Token)
	}

	// UI logic dictates this should be the inverse of the cli option
	authenticationSkippable := args.Holder.GetEnableSkipLogin()

	return auth.NewAuthManager(clientManager, tokenManager, authModes, authenticationSkippable)
}
func initAuthManager2(clientManagermaps map[string]clientapi.ClientManager) []authApi.AuthManager {
	var tpauthmaps []authApi.AuthManager
	for _, clientManager := range clientManagermaps {
		insecureClient := clientManager.InsecureClient()

		// Init default encryption key synchronizer
		synchronizerManager := sync.NewSynchronizerManager(insecureClient)
		keySynchronizer := synchronizerManager.Secret(args.Holder.GetNamespace(), authApi.EncryptionKeyHolderName)

		// Register synchronizer. Overwatch will be responsible for restarting it in case of error.
		sync.Overwatch.RegisterSynchronizer(keySynchronizer, sync.AlwaysRestart)

		// Init encryption key holder and token manager
		keyHolder := jwe.NewRSAKeyHolder(keySynchronizer)
		tokenManager := jwe.NewJWETokenManager(keyHolder)
		tokenTTL := time.Duration(args.Holder.GetTokenTTL())
		if tokenTTL != authApi.DefaultTokenTTL {
			tokenManager.SetTokenTTL(tokenTTL)
		}

		// Set token manager for client manager.
		clientManager.SetTokenManager(tokenManager)
		authModes := authApi.ToAuthenticationModes(args.Holder.GetAuthenticationMode())
		if len(authModes) == 0 {
			authModes.Add(authApi.Token)
		}

		// UI logic dictates this should be the inverse of the cli option
		authenticationSkippable := args.Holder.GetEnableSkipLogin()

		tpauthmaps = append(tpauthmaps, auth.NewAuthManager(clientManager, tokenManager, authModes, authenticationSkippable))
	}
	return tpauthmaps
}

func initArgHolder() {
	builder := args.GetHolderBuilder()
	builder.SetInsecurePort(*argInsecurePort)
	builder.SetPort(*argPort)
	builder.SetTokenTTL(*argTokenTTL)
	builder.SetMetricClientCheckPeriod(*argMetricClientCheckPeriod)
	builder.SetInsecureBindAddress(*argInsecureBindAddress)
	builder.SetBindAddress(*argBindAddress)
	builder.SetDefaultCertDir(*argDefaultCertDir)
	builder.SetCertFile(*argCertFile)
	builder.SetKeyFile(*argKeyFile)
	builder.SetApiServerHost(*argApiserverHost)
	builder.SetMetricsProvider(*argMetricsProvider)
	builder.SetHeapsterHost(*argHeapsterHost)
	builder.SetSidecarHost(*argSidecarHost)
	builder.SetKubeConfigFile(*argKubeConfigFile)
	builder.SetSystemBanner(*argSystemBanner)
	builder.SetSystemBannerSeverity(*argSystemBannerSeverity)
	builder.SetAPILogLevel(*argAPILogLevel)
	builder.SetAuthenticationMode(*argAuthenticationMode)
	builder.SetAutoGenerateCertificates(*argAutoGenerateCertificates)
	builder.SetEnableInsecureLogin(*argEnableInsecureLogin)
	builder.SetDisableSettingsAuthorizer(*argDisableSettingsAuthorizer)
	builder.SetEnableSkipLogin(*argEnableSkip)
	builder.SetNamespace(*argNamespace)
	builder.SetLocaleConfig(*localeConfig)
}

/**
 * Handles fatal init error that prevents server from doing any work. Prints verbose error
 * message and quits the server.
 */
func handleFatalInitError(err error) {
	log.Fatalf("Error while initializing connection to Kubernetes apiserver. "+
		"This most likely means that the cluster is misconfigured (e.g., it has "+
		"invalid apiserver certificates or service account's configuration) or the "+
		"--apiserver-host param points to a server that does not exist. Reason: %s\n"+
		"Refer to our FAQ and wiki pages for more information: "+
		"https://github.com/kubernetes/dashboard/wiki/FAQ", err)
}

/**
 * Handles fatal init errors encountered during service cert loading.
 */
func handleFatalInitServingCertError(err error) {
	log.Fatalf("Error while loading dashboard server certificates. Reason: %s", err)
}

/**
* Lookup the environment variable provided and set to default value if variable isn't found
 */
func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		value = fallback
	}
	return value
}

func CreateTable() {
	// create the postgres db connection
	db := db.CreateConnection()

	// close the db connection
	defer db.Close()

	sqlStatement := `CREATE TABLE IF NOT EXISTS userdetails (userid SERIAL PRIMARY KEY,username TEXT,password TEXT,token TEXT,type TEXT,tenant TEXT,role TEXT,creationtime TIMESTAMP,namespace TEXT, UNIQUE (username));`

	// execute the sql statement
	res, err := db.Exec(sqlStatement)

	if err != nil {
		fmt.Printf("Unable to execute the query. %s \n", err)
		return
	}
	fmt.Printf("Table Created in database %v \n", res)
}

func CreateOrConfigureKubeconfig() (configDetails map[string]string, err error) {

	configDetails = make(map[string]string)
	tpCount := 1
	configDir := os.Getenv("KUBECONFIG_DIR")
	if configDir == "" {
		configDir = "/opt/centaurus-configs"
	}
	useEnvConfigs := false
	if os.Getenv("USE_ENV_CONFIGS") != "" {
		useEnvConfigs, err = strconv.ParseBool(os.Getenv("USE_ENV_CONFIGS"))
		if err != nil {
			fmt.Printf("Unable to parse USE_ENV_CONFIGS value. %s \n", err)
			return
		}
	}
	for {
		configFound := false
		if !useEnvConfigs {

			_, err = os.Stat(configDir + "/" + "kubeconfig." + strings.ToLower(TENANTPARTITION) + "-" + strconv.Itoa(tpCount))
			if err == nil {
				configFound = true
			}
		}
		if useEnvConfigs {
			if tpConfig := os.Getenv(TENANTPARTITION + strconv.Itoa(tpCount) + "_CONFIG"); tpConfig != "" {
				config, _ := base64.StdEncoding.DecodeString(tpConfig)
				_, err = os.Stat(configDir)
				if err != nil {
					err = os.MkdirAll(configDir, 0777)
					if err != nil && !strings.Contains(err.Error(), "file already exists") {
						log.Printf("Unable to create config directory %s", configDir)
						return configDetails, err
					}
				}
				configFile, err := os.Create(configDir + "/" + "kubeconfig." + strings.ToLower(TENANTPARTITION) + "-" + strconv.Itoa(tpCount))
				if err != nil {
					log.Printf("error while creating config file: %s", err.Error())
				}
				_, err = configFile.Write(config)
				if err != nil {
					log.Printf("error while creating config file: %s", err.Error())
				}
				configFound = true
			}
		}
		if configFound == false {
			break
		} else {
			configDetails["kubeconfig."+strings.ToLower(TENANTPARTITION)+"-"+strconv.Itoa(tpCount)] = configDir + "/" + "kubeconfig." + strings.ToLower(TENANTPARTITION) + "-" + strconv.Itoa(tpCount)
		}
		tpCount++
	}
	if tpCount == 1 {
		return nil, errors.New("error configuring kubeconfig file")
	}

	// Configuring RP config files
	rpCount := 1

	for {
		configFound := false
		if !useEnvConfigs {
			_, err = os.Stat(configDir + "/" + "kubeconfig." + strings.ToLower(RESOURCEPARTITION) + "-" + strconv.Itoa(rpCount))
			if err == nil {
				configFound = true
			}
		}
		if useEnvConfigs {
			if rpConfig := os.Getenv(RESOURCEPARTITION + strconv.Itoa(rpCount) + "_CONFIG"); rpConfig != "" {
				config, _ := base64.StdEncoding.DecodeString(rpConfig)
				configFile, err := os.Create(configDir + "/" + "kubeconfig." + strings.ToLower(RESOURCEPARTITION) + "-" + strconv.Itoa(rpCount))
				if err != nil {
					log.Printf("Err1: %s", err.Error())
					// handleFatalInitError(err)
				}
				_, err = configFile.Write(config)
				if err != nil {
					log.Printf("error while creating config file: %s", err.Error())
				}
				configFound = true
			}
		}
		if configFound == false {
			break
		} else {
			configDetails["kubeconfig."+strings.ToLower(RESOURCEPARTITION)+"-"+strconv.Itoa(rpCount)] = configDir + "/" + "kubeconfig." + strings.ToLower(RESOURCEPARTITION) + "-" + strconv.Itoa(rpCount)
		}
		rpCount++
	}
	if rpCount == 1 || tpCount == 1 {
		return configDetails, errors.New("error configuring kubeconfig file")
	}
	return configDetails, nil
}
