// Copyright 2020 Authors of Arktos.
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

import {HttpParams} from '@angular/common/http';
import {Component, Input} from '@angular/core';
import {ResourcePartitionList, ResourcePartition} from '@api/backendapi';
import {Observable} from 'rxjs/Observable';

import {ResourceListWithStatuses} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {ResourceService} from '../../../services/resource/resource';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {MenuComponent} from '../../list/column/menu/component';
import {VerberService} from '../../../services/global/verber';
import {Router} from "@angular/router";

@Component({
  selector: 'kd-resource-partition-list',
  templateUrl: './template.html',
})
// @ts-ignore
export class ResourcePartitionListComponent extends ResourceListWithStatuses<ResourcePartitionList, ResourcePartition> {
  @Input() endpointTp = EndpointManager.resource(Resource.resourcePartition).list();

  constructor(
    readonly verber_: VerberService,
    private router_: Router,
    private readonly resourcePartition_: ResourceService<ResourcePartitionList>,
    notifications: NotificationsService,
  ) {
    super('resourcePartition', notifications);
    this.id = ListIdentifier.resourcePartition;
    this.groupId = ListGroupIdentifier.cluster;

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register status icon handlers
    this.registerBinding(this.icon.checkCircle, 'kd-success', this.isInSuccessState);
  }

  setClusterName($event:any) {
    const clusterName = $event.target.innerHTML.replace(/^\s+|\s+$/gm,'');
    this.router_.navigateByUrl('/node', {state: {clusterName}});
  }

  getResourceObservable(params?: HttpParams): Observable<ResourcePartitionList> {
    return this.resourcePartition_.get(this.endpointTp, undefined, params);
  }

  map(resourcePartitionList: ResourcePartitionList): ResourcePartition[] {
    return resourcePartitionList.resourcePartitions
  }

  isInSuccessState(): boolean {
    return true;
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'nodecount','cpu','memory','health','etcd'];
  }

}
