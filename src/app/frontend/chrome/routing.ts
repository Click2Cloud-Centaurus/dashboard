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

      {
        path: 'cluster',
        loadChildren: 'resource/cluster/module#ClusterModule',
      },
      {
        path: 'clusterrole',
        loadChildren: 'resource/cluster/clusterrole/module#ClusterRoleModule',
      },
      {
        path: 'partition',
        loadChildren: 'resource/cluster/partition/module#PartitionModule',
      },
      {
        path: 'tptenant',
        loadChildren: 'resource/cluster/tptenant/module#TpTenantModule',
      },
      {
        path: 'tenant',
        loadChildren: 'resource/cluster/tenant/module#TenantModule',
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
      {
        path: 'tenantmanagement',
        loadChildren: 'resource/tenantmanagement/module#TenantManagementModule',
      },
      {
        path: 'tenantmonitoring',
        loadChildren: 'resource/tenantmanagement/tenantmonitoring/module#TenantMonitoringModule',
      },
      {
        path: 'role',
        loadChildren: 'resource/tenantmanagement/role/module#RoleModule',
      },
      {
        path: 'resourcequota',
        loadChildren: 'resource/tenantmanagement/resourcequota/module#ResourceQuotaModule',
      },


      // Overview
      {
        path: 'overview',
        loadChildren: 'overview/module#OverviewModule',
      },
      {
        path: 'usermanagement',
        loadChildren: 'resource/usermanagement/module#UserManagementModule',
      },
      {
        path: 'user',
        loadChildren: 'resource/usermanagement/user/module#UsersModule',

      },

      // Workloads group
      {
        path: 'workloads',
        loadChildren: 'resource/workloads/module#WorkloadsModule',
      },
      {
        path: 'namespace',
        loadChildren: 'resource/workloads/namespace/module#NamespaceModule',
      },
      {
        path: 'serviceaccount',
        loadChildren: 'resource/workloads/serviceaccount/module#ServiceAccountModule',
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
        path: 'statefulset',
        loadChildren: 'resource/workloads/statefulset/module#StatefulSetModule',
      },
      {
        path: 'virtualmachine',
        loadChildren: 'resource/workloads/virtualmachine/module#VirtualMachineModule',
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
      {
        path: 'customresourcedefinition',
        loadChildren: 'crd/module#CrdModule'
      },
      {
        path: 'network',
        loadChildren: 'network/module#NetworkModule',
      },

      // Others
      {
        path: 'settings',
        loadChildren: 'settings/module#SettingsModule',
      },
      {
        path: 'about',
        loadChildren: 'about/module#AboutModule',
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
