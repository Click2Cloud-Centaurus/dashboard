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


import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RoleDetail} from '@api/backendapi';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ActionbarService, ResourceMeta} from '../../../../common/services/global/actionbar';
import {NotificationsService} from '../../../../common/services/global/notifications';
import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {NamespacedResourceService} from '../../../../common/services/resource/resource';
import {TenantService} from "../../../../common/services/global/tenant";

@Component({
  selector: 'kd-role-detail',
  templateUrl: './template.html',
})

export class RoleDetailComponent implements OnInit, OnDestroy {
  private readonly endpoint_ = EndpointManager.resource(Resource.role, true,true);
  private readonly unsubscribe_ = new Subject<void>();

  role: RoleDetail;
  isInitialized = false;

  constructor(
    private readonly role_: NamespacedResourceService<RoleDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly route_: ActivatedRoute,
    private readonly tenant_: TenantService,
    private readonly notifications_: NotificationsService,
  ) {}

  ngOnInit(): void {
    const resourceName = this.route_.snapshot.params.resourceName;
    const resourceNamespace = this.route_.snapshot.params.resourceNamespace === undefined ?
      window.history.state.namespace : this.route_.snapshot.params.resourceNamespace;
    const resourceTenant = this.tenant_.current() === 'system' ?
      window.history.state.tenant : this.tenant_.current()

    let endpoint = ''
    if (sessionStorage.getItem('userType') === 'cluster-admin') {
      endpoint = `api/v1/tenants/${resourceTenant}/role/${resourceNamespace}/${resourceName}`
    } else {
      endpoint = this.endpoint_.detail()
    }

    this.role_
      .get(endpoint, resourceName, resourceNamespace, undefined, resourceTenant)
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe((d: RoleDetail) => {
        this.role = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta('Role', d.objectMeta, d.typeMeta));
        this.isInitialized = true;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
    this.actionbar_.onDetailsLeave.emit();
  }
}
