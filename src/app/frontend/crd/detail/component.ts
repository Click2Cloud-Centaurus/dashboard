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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CRDDetail} from '@api/backendapi';
import {Subscription} from 'rxjs';
import {ActionbarService, ResourceMeta} from '../../common/services/global/actionbar';
import {NotificationsService} from '../../common/services/global/notifications';
import {ResourceService} from '../../common/services/resource/resource';
import {EndpointManager, Resource} from '../../common/services/resource/endpoint';
import {TenantService} from '../../common/services/global/tenant';

@Component({selector: 'kd-crd-detail', templateUrl: './template.html'})
export class CRDDetailComponent implements OnInit, OnDestroy {
  private crdSubscription_: Subscription;
  private readonly endpoint_ = EndpointManager.resource(Resource.crd, false, true);
  crd: CRDDetail;
  crdObjectEndpoint: string;
  isInitialized = false;
  tenantName: string;
  partitionName: string;
  partition: string;

  constructor(
    private readonly crd_: ResourceService<CRDDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly tenant_: TenantService,
    private readonly notifications_: NotificationsService,
  ) {
    this.tenantName =
      this.tenant_.current() === 'system' && sessionStorage.getItem('crdPartition') !== null
        ? this.tenant_.current()
        : this.tenant_.resourceTenant();
    this.partitionName = this.tenantName === 'system' ? sessionStorage.getItem('crdPartition') : '';
    this.partition =
      this.tenantName === 'system'
        ? 'partition/' + sessionStorage.getItem('crdPartition') + '/'
        : '';
  }

  ngOnInit(): void {
    const {crdName} = this.activatedRoute_.snapshot.params;
    this.crdObjectEndpoint = EndpointManager.resource(Resource.crd, false, true).child(
      crdName,
      Resource.crdObject,
      undefined,
      this.tenantName,
      this.partitionName,
    );

    let endpoint = '';
    if (sessionStorage.getItem('userType') === 'cluster-admin') {
      endpoint = `api/v1/${this.partition}tenants/${this.tenantName}/crd/${crdName}`;
    } else {
      endpoint = this.endpoint_.detail();
    }
    this.crdSubscription_ = this.crd_.get(endpoint, crdName).subscribe((d: CRDDetail) => {
      this.crd = d;
      this.notifications_.pushErrors(d.errors);
      this.actionbar_.onInit.emit(
        new ResourceMeta('Custom Resource Definition', d.objectMeta, d.typeMeta),
      );
      this.isInitialized = true;
    });
  }

  ngOnDestroy(): void {
    this.crdSubscription_.unsubscribe();
    this.actionbar_.onDetailsLeave.emit();
  }
}
