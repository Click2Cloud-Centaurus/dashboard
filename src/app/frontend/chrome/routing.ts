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

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../common/services/guard/auth';
import {SystemGuard} from '../common/services/guard/system';
import {ChromeComponent} from './component';


const routes: Routes = [
  {path: '', redirectTo: '/overview', pathMatch: 'full'},
  {
    path: '',
    component: ChromeComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'error',
        loadChildren: 'error/module#ErrorModule',
      },

      // Cluster Management
      {
        path: 'cluster',
        loadChildren: 'resource/cluster/module#ClusterModule',
      },
      {
        path: 'tenant',
        loadChildren: 'resource/cluster/tenant/module#TenantModule',
      },
      {
        path: 'clusterrole',
        loadChildren: 'resource/cluster/clusterrole/module#ClusterRoleModule',
      },
      {
        path: 'namespace',
        loadChildren: 'resource/cluster/namespace/module#NamespaceModule',
      },
      {
        path: 'node',
        loadChildren: 'resource/cluster/node/module#NodeModule',
        canActivate: [SystemGuard],
      },
      {
        path: 'persistentvolume',
        loadChildren: 'resource/cluster/persistentvolume/module#PersistentVolumeModule',
      },
      {
        path: 'storageclass',
        loadChildren: 'resource/cluster/storageclass/module#StorageClassModule',
      },

      // Overview
      {
        path: 'overview',
        loadChildren: 'overview/module#OverviewModule',
      },

      // Workloads group
      {
        path: 'workloads',
        loadChildren: 'resource/workloads/module#WorkloadsModule',
      },
      {
        path: 'cronjob',
        loadChildren: 'resource/workloads/cronjob/module#CronJobModule',
      },
      {
        path: 'daemonset',
        loadChildren: 'resource/workloads/daemonset/module#DaemonSetModule',
      },
      {
        path: 'deployment',
        loadChildren: 'resource/workloads/deployment/module#DeploymentModule',
      },
      {
        path: 'job',
        loadChildren: 'resource/workloads/job/module#JobModule',
      },
      {
        path: 'pod',
        loadChildren: 'resource/workloads/pod/module#PodModule',
      },
      {
        path: 'replicaset',
        loadChildren: 'resource/workloads/replicaset/module#ReplicaSetModule',
      },
      {
        path: 'replicationcontroller',
        loadChildren: 'resource/workloads/replicationcontroller/module#ReplicationControllerModule',
      },
      {
        path: 'statefulset',
        loadChildren: 'resource/workloads/statefulset/module#StatefulSetModule',
      },

      // Discovery and load balancing group
      {
        path: 'discovery',
        loadChildren: 'resource/discovery/module#DiscoveryModule',
      },
      {
        path: 'ingress',
        loadChildren: 'resource/discovery/ingress/module#IngressModule',
      },
      {
        path: 'service',
        loadChildren: 'resource/discovery/service/module#ServiceModule',
      },

      // Config group
      {
        path: 'config',
        loadChildren: 'resource/config/module#ConfigModule',
      },
      {
        path: 'configmap',
        loadChildren: 'resource/config/configmap/module#ConfigMapModule',
      },
      {
        path: 'persistentvolumeclaim',
        loadChildren: 'resource/config/persistentvolumeclaim/module#PersistentVolumeClaimModule',
      },
      {
        path: 'secret',
        loadChildren: 'resource/config/secret/module#SecretModule',
      },

      // Custom resource definitions
      {path: 'customresourcedefinition', loadChildren: 'crd/module#CrdModule'},

      // Others
      {
        path: 'settings',
        loadChildren: 'settings/module#SettingsModule',
      },
      {
        path: 'about',
        loadChildren: 'about/module#AboutModule',
      },


      //Tenant management
      {
        path: 'clustermanagement',
        loadChildren: 'clustermanagement/module#ClustermanagementModule',
      },
      {
        path: 'clusterhealth',
        loadChildren: 'clustermanagement/clusterhealth/module#ClusterhealthModule',

      },
      {
        path: 'clusternamespace',
        loadChildren: 'clustermanagement/clusternamespace/module#ClusterNamespaceModule',

      },
      {
        path: 'role',
        loadChildren: 'clustermanagement/role/module#RoleModule',

      },
      {
        path: 'quotas',
        loadChildren: 'clustermanagement/quotas/module#QuotasModule',

      },
      {
        path: 'users',
        loadChildren: 'clustermanagement/users/module#UsersModule',

      },

      {
        path: 'create',
        loadChildren: 'create/module#CreateModule',
      },
      {
        path: 'log',
        loadChildren: 'logs/module#LogsModule',
      },
      {
        path: 'shell',
        loadChildren: 'shell/module#ShellModule',
      },


      {
        path: 'search',
        loadChildren: 'search/module#SearchModule',
        runGuardsAndResolvers: 'always',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChromeRoutingModule {}
