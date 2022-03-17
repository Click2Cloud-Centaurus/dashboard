
import {HttpParams} from '@angular/common/http';
import {Component, Input} from '@angular/core';
import {Namespace, NamespaceList, ObjectMeta, TypeMeta} from '@api/backendapi';
import {Observable} from 'rxjs/Observable';

import {ResourceListWithStatuses} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {ResourceService} from '../../../services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {VerberService} from '../../../services/global/verber';
import {ActivatedRoute} from "@angular/router";
import {TenantService} from "../../../services/global/tenant";


@Component({
  selector: 'kd-namespace-list',
  templateUrl: './template.html',
})
export class NamespaceListComponent extends ResourceListWithStatuses<NamespaceList, Namespace> {
  @Input() endpoint = EndpointManager.resource(Resource.namespace, false, true).list();

  displayName: string;
  typeMeta: TypeMeta;
  objectMeta: ObjectMeta;
  tenantName: string;

  constructor(
    private readonly verber_: VerberService,
    private readonly namespace_: ResourceService<NamespaceList>,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly tenant_: TenantService,
    notifications: NotificationsService,
  ) {
    super('namespace', notifications);
    this.id = ListIdentifier.namespace;
    this.groupId = ListGroupIdentifier.cluster;

    // Register status icon handlers
    this.registerBinding(this.icon.checkCircle, 'kd-success', this.isInSuccessState);
    this.registerBinding(this.icon.error, 'kd-error', this.isInErrorState);

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    this.tenantName = this.activatedRoute_.snapshot.params.resourceName === undefined ?
      this.tenant_.current() : this.tenant_.resourceTenant()
    sessionStorage.setItem('namespaceTenant', this.tenantName);
  }

  getResourceObservable(params?: HttpParams): Observable<NamespaceList> {
    const partition = this.tenantName === 'system' ? 'partition/' + this.tenant_.tenantPartition() + '/' : ''
    let endpoint = ''
    if (sessionStorage.getItem('userType') === 'cluster-admin') {
      endpoint = `api/v1/${partition}tenants/${this.tenantName}/namespace`
    } else {
      endpoint = this.endpoint
    }
    return this.namespace_.get(endpoint, undefined, params, this.tenantName);
  }

  map(namespaceList: NamespaceList): Namespace[] {
    return namespaceList.namespaces;
  }

  isInErrorState(resource: Namespace): boolean {
    return resource.phase === 'Terminating';
  }

  isInSuccessState(resource: Namespace): boolean {
    return resource.phase === 'Active';
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'labels', 'phase', 'age'];
  }

  onClick(): void {
    this.verber_.showNamespaceCreateDialog(this.displayName, this.typeMeta, this.objectMeta); //added showNamespaceCreateDialog
  }
}
