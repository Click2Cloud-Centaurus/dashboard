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

import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
// import {ActionbarComponent} from '../product/actionbar/component';
import {ClusterListComponent} from "./list/component";
import {CLUSTERMANAGEMENT_ROUTE} from "../routing";
import {HealthDetailComponent} from "./healthdetail/component";
import {DEFAULT_ACTIONBAR} from "../../common/components/actionbars/routing";
import {NodeDetailComponent} from "../../resource/cluster/node/detail/component";


const CLUSTERHEALTH_LIST_ROUTE: Route = {
  path: '',
  component: ClusterListComponent,
  data: {
    breadcrumb: 'Tenant Monitoring',
    parent: CLUSTERMANAGEMENT_ROUTE,
  },
};


const CLUSTERHEALTH_DETAIL_ROUTE: Route = {
  path: ':resourceName',
  component: HealthDetailComponent,
  data: {
    breadcrumb: ' {{ resourceName }} ',
    parent: CLUSTERHEALTH_LIST_ROUTE,
  },
};

@NgModule({
  imports: [RouterModule.forChild([CLUSTERHEALTH_LIST_ROUTE, CLUSTERHEALTH_DETAIL_ROUTE, DEFAULT_ACTIONBAR])],
  exports: [RouterModule],
})
export class ClusterHealthRoutingModule {}
