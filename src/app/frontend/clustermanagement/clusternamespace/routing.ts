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

import {CLUSTERMANAGEMENT_ROUTE} from '../routing';
import {DEFAULT_ACTIONBAR} from "../../common/components/actionbars/routing";
import {NactionbarComponent} from './clusterdetail/nactionbar/component';
import {ClusterNamespaceDetailComponent} from './clusterdetail/component';
import {ClusterNamespaceListComponent} from './clusterlist/component';

const CLUSTERNAMESPACE_LIST_ROUTE: Route = {
  path: '',
  component: ClusterNamespaceListComponent,
  data: {
    breadcrumb: 'Namespaces',
    parent: CLUSTERMANAGEMENT_ROUTE,
  },
};

const CLUSTERNAMESPACE_DETAIL_ROUTE: Route = {
  path: ':resourceName',
  component: ClusterNamespaceDetailComponent,
  data: {
    breadcrumb: ' {{ resourceName }} ',
    parent: CLUSTERNAMESPACE_LIST_ROUTE,
  },
};

export const ACTIONBAR = {
  path: '',
  component: NactionbarComponent,
  outlet: 'actionbar',
};

@NgModule({
  imports: [RouterModule.forChild([CLUSTERNAMESPACE_LIST_ROUTE, CLUSTERNAMESPACE_DETAIL_ROUTE, DEFAULT_ACTIONBAR])],
  exports: [RouterModule],
})
export class ClusterNamespaceRoutingModule {}
