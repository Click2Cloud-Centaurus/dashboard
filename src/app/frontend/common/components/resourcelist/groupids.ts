export enum ListIdentifier {
  role = 'roleList',
  clusterRole = 'clusterRoleList',
  namespace = 'namespaceList',
  node = 'nodeList',
  persistentVolume = 'persistentVolumeList',
  storageClass = 'storageClassList',
  cronJob = 'cronJobList',
  crd = 'crdList',
  crdObject = 'crdObjectList',
  job = 'jobList',
  deployment = 'deploymentList',
  daemonSet = 'daemonSetList',
  pod = 'podList',
  virtualMachine = 'virtualMachineList',
  replicaSet = 'replicaSetList',
  ingress = 'ingressList',
  service = 'serviceList',
  configMap = 'configMapList',
  persistentVolumeClaim = 'persistentVolumeClaimList',
  secret = 'secretList',
  resourcequota = 'resourcequota',
  statefulSet = 'statefulSetList',
  event = 'event',
  resource = 'resource',
  tenant = 'tenant',
  resourcePartition = 'resourcepartition',
  tenantPartition = 'tenantpartition',
  user = 'users',
  serviceaccount = 'serviceaccount',
  network = 'crdList',
  networkObject = 'crdObjectList',
}

export enum ListGroupIdentifier {
  cluster = 'clusterGroup',
  workloads = 'workloadsGroup',
  discovery = 'discoveryGroup',
  config = 'configGroup',
  none = 'none',
}
