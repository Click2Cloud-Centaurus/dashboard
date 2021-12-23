
import {HttpParams} from '@angular/common/http';
import {Component, Input} from '@angular/core';
import {ClusterRole, ClusterRoleList} from '@api/backendapi';
import {Observable} from 'rxjs/Observable';
import {ResourceListBase} from "../../../../common/resources/list";
import {EndpointManager, Resource} from "../../../../common/services/resource/endpoint";
import {VerberService} from "../../../../common/services/global/verber";
import {ResourceService} from "../../../../common/services/resource/resource";
import {NotificationsService} from "../../../../common/services/global/notifications";
import {
  ListGroupIdentifier,
  ListIdentifier
} from "../../../../common/components/resourcelist/groupids";
import {MenuComponent} from "../../../../common/components/list/column/menu/component";

@Component({
  selector: 'kd-cluster-health-list-state',
  template: '<kd-cluster-role-list></kd-cluster-role-list>',
})


export class ClusterRoleListComponent extends ResourceListBase<ClusterRoleList, ClusterRole> {
  @Input() endpoint = EndpointManager.resource(Resource.clusterRole, false, true).list();
  typeMeta:any="";
  objectMeta:any;
  constructor(
    private readonly verber_: VerberService,
    private readonly clusterRole_: ResourceService<ClusterRoleList>,
    notifications: NotificationsService,
  ) {
    super('clusterrole', notifications);
    this.id = ListIdentifier.clusterRole;
    this.groupId = ListGroupIdentifier.cluster;

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);
  }

  getResourceObservable(params?: HttpParams): Observable<ClusterRoleList> {
    return this.clusterRole_.get(this.endpoint, undefined, params);
  }

  map(clusterRoleList: ClusterRoleList): ClusterRole[] {
    return clusterRoleList.items;
  }

  getDisplayColumns(): string[] {
    return ['name', 'age'];
  }
  getDisplayColumns2(): string[] {
    return ['statusicon', 'name', 'nodecount', 'cpulim', 'memlim', 'tentcount', 'health', 'etcd'];
  }

  onClick(): void {
    this.verber_.showRoleCreateDialog('Role name',this.typeMeta,this.objectMeta);
  }

  onClick2(): void {
    this.verber_.showClusterroleCreateDialog('Role name',this.typeMeta,this.objectMeta);
  }
}
