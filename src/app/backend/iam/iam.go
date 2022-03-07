// Copyright 2020 Authors of Arktos.
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

package iam

import (
	"errors"
	"log"
	"os"
	"strings"
	"time"

	"github.com/CentaurusInfra/dashboard/src/app/backend/api"
	"github.com/CentaurusInfra/dashboard/src/app/backend/args"
	"github.com/CentaurusInfra/dashboard/src/app/backend/client"
	"github.com/CentaurusInfra/dashboard/src/app/backend/iam/db"
	"github.com/CentaurusInfra/dashboard/src/app/backend/iam/model"
	"github.com/CentaurusInfra/dashboard/src/app/backend/resource/clusterrolebinding"
	ns "github.com/CentaurusInfra/dashboard/src/app/backend/resource/namespace"
	"github.com/CentaurusInfra/dashboard/src/app/backend/resource/serviceaccount"
	rbac "k8s.io/api/rbac/v1"
)

// Create cluster Admin

func CreateClusterAdmin() error {
	const adminName = "centaurus"
	const dashboardNS = "centaurus-dashboard"
	const clusterRoleName = "cluster-admin"
	const saName = adminName + "-dashboard-sa"
	admin := os.Getenv("CLUSTER_ADMIN")
	if admin == "" {
		admin = adminName
	}
	clientManager := client.NewClientManager(args.Holder.GetKubeConfigFile(), args.Holder.GetApiServerHost())

	// TODO Check if centaurus-dashboard namespace exists or not using GET method
	k8sClient := clientManager.InsecureClient()

	// Create namespace
	namespaceSpec := new(ns.NamespaceSpec)
	namespaceSpec.Name = dashboardNS
	if err := ns.CreateNamespace(namespaceSpec, "system", k8sClient); err != nil {
		log.Printf("Create namespace for admin user failed, err:%s ", err.Error())
		//return err
	} else {
		log.Printf("Create Namespace successfully")
	}

	// Create Service Account
	serviceAccountSpec := new(serviceaccount.ServiceAccountSpec)
	serviceAccountSpec.Name = saName
	serviceAccountSpec.Namespace = dashboardNS
	if err := serviceaccount.CreateServiceAccount(serviceAccountSpec, k8sClient); err != nil {
		log.Printf("Create service account for admin user failed, err:%s ", err.Error())
		//return err
	}

	// Create Cluster Role
	//var verbs []string
	//var apiGroups []string
	//var resources []string
	//verbs = append(verbs, "*")
	//apiGroups = append(apiGroups, "", "extensions", "apps")
	//resources = append(resources, "deployments", "pods", "services", "secrets", "namespaces")

	//clusterRoleSpec := &clusterrole.ClusterRoleSpec{
	//	Name:      roleName,
	//	Verbs:     verbs,
	//	APIGroups: apiGroups,
	//	Resources: resources,
	//}
	//
	//if err := clusterrole.CreateClusterRole(clusterRoleSpec, k8sClient); err != nil {
	//	log.Printf("Create cluster role for admin user failed, err:%s ", err.Error())
	//	return err
	//}

	// Create Cluster Role Binding
	clusterRoleBindingSpec := &clusterrolebinding.ClusterRoleBindingSpec{
		Name: "admin-cluster-role-binding",
		Subject: rbac.Subject{
			Kind:      "ServiceAccount",
			APIGroup:  "",
			Name:      saName,
			Namespace: dashboardNS,
		},
		RoleRef: rbac.RoleRef{
			APIGroup: "rbac.authorization.k8s.io",
			Kind:     "ClusterRole",
			Name:     clusterRoleName,
		},
	}
	if err := clusterrolebinding.CreateClusterRoleBindings(clusterRoleBindingSpec, k8sClient); err != nil {
		log.Printf("Create cluster role binding for admin user failed, err:%s ", err.Error())
		// return err
	}

	// Get Token
	var found = false
	var retrial = 0
	var token []byte
	for {
		if retrial == 4 && !found {
			break
		}
		secretList, err := k8sClient.CoreV1().SecretsWithMultiTenancy(dashboardNS, "").List(api.ListEverything)
		if err != nil {
			log.Printf("Get secret for admin user failed, err:%s \n", err.Error())
			return errors.New("secret not found for admin user")
		}

		for _, secret := range secretList.Items {
			checkName := strings.Contains(secret.Name, saName)
			if secret.Namespace == dashboardNS && checkName {
				token = secret.Data["token"]
				found = true
				break
			}
		}
		if found {
			break
		}
		time.Sleep(1)
	}
	if !found && retrial == 4 {
		log.Printf("Get token for admin user failed after 3 retrial, err:%s \n", "Get token failed")
		return nil
	}

	// Create User and enter data into DB
	user := model.User{
		ID:                0,
		Username:          admin,
		Password:          "Centaurus@123",
		Token:             string(token),
		Type:              "cluster-admin",
		Tenant:            "system",
		Role:              "",
		NameSpace:         "default",
		CreationTimestamp: time.Now(),
	}

	// call insertUser function and pass the user data
	insertID := db.InsertUser(user)

	log.Printf("\nUser Id: %d", insertID)
	return nil
}
