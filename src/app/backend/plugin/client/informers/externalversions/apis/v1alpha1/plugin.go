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

// Code generated by informer-gen. DO NOT EDIT.

package v1alpha1

import (
	time "time"

	apisv1alpha1 "github.com/CentaurusInfra/dashboard/src/app/backend/plugin/apis/v1alpha1"
	versioned "github.com/CentaurusInfra/dashboard/src/app/backend/plugin/client/clientset/versioned"
	internalinterfaces "github.com/CentaurusInfra/dashboard/src/app/backend/plugin/client/informers/externalversions/internalinterfaces"
	v1alpha1 "github.com/CentaurusInfra/dashboard/src/app/backend/plugin/client/listers/apis/v1alpha1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	runtime "k8s.io/apimachinery/pkg/runtime"
	watch "k8s.io/apimachinery/pkg/watch"
	cache "k8s.io/client-go/tools/cache"
)

// PluginInformer provides access to a shared informer and lister for
// Plugins.
type PluginInformer interface {
	Informer() cache.SharedIndexInformer
	Lister() v1alpha1.PluginLister
}

type pluginInformer struct {
	factory          internalinterfaces.SharedInformerFactory
	tweakListOptions internalinterfaces.TweakListOptionsFunc
	namespace        string
	tenant           string
}

// NewPluginInformer constructs a new informer for Plugin type.
// Always prefer using an informer factory to get a shared informer instead of getting an independent
// one. This reduces memory footprint and number of connections to the server.
func NewPluginInformer(client versioned.Interface, namespace string, resyncPeriod time.Duration, indexers cache.Indexers) cache.SharedIndexInformer {
	return NewFilteredPluginInformer(client, namespace, resyncPeriod, indexers, nil)
}

func NewPluginInformerWithMultiTenancy(client versioned.Interface, namespace string, resyncPeriod time.Duration, indexers cache.Indexers, tenant string) cache.SharedIndexInformer {
	return NewFilteredPluginInformerWithMultiTenancy(client, namespace, resyncPeriod, indexers, nil, tenant)
}

// NewFilteredPluginInformer constructs a new informer for Plugin type.
// Always prefer using an informer factory to get a shared informer instead of getting an independent
// one. This reduces memory footprint and number of connections to the server.
func NewFilteredPluginInformer(client versioned.Interface, namespace string, resyncPeriod time.Duration, indexers cache.Indexers, tweakListOptions internalinterfaces.TweakListOptionsFunc) cache.SharedIndexInformer {
	return NewFilteredPluginInformerWithMultiTenancy(client, namespace, resyncPeriod, indexers, tweakListOptions, "system")
}

func NewFilteredPluginInformerWithMultiTenancy(client versioned.Interface, namespace string, resyncPeriod time.Duration, indexers cache.Indexers, tweakListOptions internalinterfaces.TweakListOptionsFunc, tenant string) cache.SharedIndexInformer {
	return cache.NewSharedIndexInformer(
		&cache.ListWatch{
			ListFunc: func(options v1.ListOptions) (runtime.Object, error) {
				if tweakListOptions != nil {
					tweakListOptions(&options)
				}
				return client.DashboardV1alpha1().PluginsWithMultiTenancy(namespace, tenant).List(options)
			},
			WatchFunc: func(options v1.ListOptions) watch.AggregatedWatchInterface {
				if tweakListOptions != nil {
					tweakListOptions(&options)
				}
				return client.DashboardV1alpha1().PluginsWithMultiTenancy(namespace, tenant).Watch(options)
			},
		},
		&apisv1alpha1.Plugin{},
		resyncPeriod,
		indexers,
	)
}

func (f *pluginInformer) defaultInformer(client versioned.Interface, resyncPeriod time.Duration) cache.SharedIndexInformer {
	return NewFilteredPluginInformerWithMultiTenancy(client, f.namespace, resyncPeriod, cache.Indexers{cache.NamespaceIndex: cache.MetaNamespaceIndexFunc}, f.tweakListOptions, f.tenant)
}

func (f *pluginInformer) Informer() cache.SharedIndexInformer {
	return f.factory.InformerFor(&apisv1alpha1.Plugin{}, f.defaultInformer)
}

func (f *pluginInformer) Lister() v1alpha1.PluginLister {
	return v1alpha1.NewPluginLister(f.Informer().GetIndexer())
}
