# Installation

## Official release

**IMPORTANT:** Before upgrading from older version of Dashboard to 1.7+ make sure to delete Cluster Role Binding for `centaurus-dashboard` Service Account, otherwise Dashboard will have full admin access to the cluster.

### Quick setup

The fastest way of deploying Dashboard has been described in our [README](../../README.md). It is destined for people that are new to Kubernetes and want to quickly start using Dashboard. Other possible setups for more experienced users, that want to know more about our deployment procedure can be found below.

### Recommended setup

To access Dashboard directly (without `kubectl proxy`) valid certificates should be used to establish a secure HTTPS connection. They can be generated using public trusted Certificate Authorities like [Let's Encrypt](https://letsencrypt.org/). Use them to replace the auto-generated certificates from Dashboard.

By default self-signed certificates are generated and stored in-memory. In case you would like to use your custom certificates follow the below steps, otherwise skip directly to the Dashboard deploy part.

Custom certificates have to be stored in a secret named `centaurus-dashboard-certs` in the same namespace as Kubernetes Dashboard. Assuming that you have `dashboard.crt` and `dashboard.key` files stored under `$HOME/certs` directory, you should create secret with contents of these files:

```
kubectl create secret generic centaurus-dashboard-certs --from-file=$HOME/certs -n centaurus-dashboard
```

Afterwards, you are ready to deploy Dashboard using the following command:

```
kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-beta4/aio/deploy/recommended.yaml
```

### Alternative setup

This setup is not fully secure. Certificates are not used and Dashboard is exposed only over HTTP. In this setup access control can be ensured only by using [Authorization Header](./access-control/README.md#authorization-header) feature.

To deploy Dashboard execute following command:

```
kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-beta4/aio/deploy/alternative.yaml
```

## Development release

Besides official releases, there are also development releases, that are pushed after every successful master build. It is not advised to use them on production environment as they are less stable than the official ones. Following sections describe installation and discovery of development releases.

### Installation

In most of the use cases you need to execute the following command to deploy latest development release:

```
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-beta4/aio/deploy/head.yaml
```

### Update

Once installed, the deployment is not automatically updated. In order to update it you need to delete the deployment's pods and wait for it to be recreated. After recreation, it should use the latest image.

Delete all Dashboard pods (assuming that Dashboard is deployed in centaurus-dashboard namespace):

```
kubectl -n centaurus-dashboard delete $(kubectl -n centaurus-dashboard get pod -o name | grep dashboard)
pod "dashboard-metrics-scraper-fb986f88d-gnfnk" deleted
pod "centaurus-dashboard-7d8b9cc8d-npljm" deleted
```

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
