// Copyright 2017 The Kubernetes Authors.
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
import {Component, Input, OnInit} from '@angular/core';
import {Event, EventList} from '@api/backendapi';
import {Observable} from 'rxjs/Observable';

import {ResourceListWithStatuses} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {NamespacedResourceService} from '../../../services/resource/resource';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {TenantService} from '../../../services/global/tenant';
import {ActivatedRoute} from '@angular/router';

const EVENT_TYPE_WARNING = 'Warning';

@Component({selector: 'kd-event-list', templateUrl: './template.html'})
export class EventListComponent extends ResourceListWithStatuses<EventList, Event>
  implements OnInit {
  @Input() endpoint: string;
  private tenantName: string;
  private partition: string;
  private reqFrom: string;
  private nodeName: string;

  constructor(
    private readonly eventList: NamespacedResourceService<EventList>,
    private readonly tenant_: TenantService,
    private readonly activatedRoute_: ActivatedRoute,
    notifications: NotificationsService,
  ) {
    super('', notifications);
    this.id = ListIdentifier.event;
    this.groupId = ListGroupIdentifier.none;

    // Register status icon handler
    this.registerBinding(this.icon.warning, 'kd-warning', this.isWarning);
    this.registerBinding(this.icon.none, '', this.isNormal.bind(this));

    this.tenantName =
      this.tenant_.current() === 'system' ? this.tenant_.resourceTenant() : this.tenant_.current();
    this.partition = this.tenantName === 'system' ? this.tenant_.tenantPartition() : '';
  }

  ngOnInit(): void {
    if (this.endpoint === undefined) {
      throw Error('Endpoint is a required parameter of event list.');
    }

    super.ngOnInit();
  }

  isWarning(event: Event): boolean {
    return event.type === EVENT_TYPE_WARNING;
  }

  isNormal(event: Event): boolean {
    return !this.isWarning(event);
  }

  getResourceObservable(params?: HttpParams): Observable<EventList> {
    this.tenantName = this.tenantName === '' ? this.tenant_.current() : this.tenantName;
    // @ts-ignore
    this.reqFrom = this.activatedRoute_.snapshot['_routerState'].url;
    // this.nodeName = this.reqFrom ? (this.reqFrom.split('/')).pop() : ''
    this.nodeName =
      this.reqFrom && this.reqFrom.includes('/node/') ? this.reqFrom.split('/').pop() : '';
    let endpoint = '';
    if (sessionStorage.getItem('userType') === 'cluster-admin' && this.reqFrom.includes('/node/')) {
      endpoint = `api/v1${this.reqFrom}/event`;
    } else {
      endpoint = this.endpoint;
    }
    return this.eventList.get(
      endpoint,
      undefined,
      undefined,
      params,
      this.tenantName,
      this.partition,
    );
  }

  map(eventList: EventList): Event[] {
    let eventListData: any = [];
    if (this.nodeName !== undefined || null || '') {
      eventList.events.map(event => {
        if (event.sourceHost.includes(this.nodeName)) {
          eventListData.push(event);
        }
      });
      this.totalItems = eventListData.length;
    } else {
      eventListData = eventList.events;
    }
    return eventListData;
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'message', 'source', 'subobject', 'count', 'firstseen', 'lastseen'];
  }
}
