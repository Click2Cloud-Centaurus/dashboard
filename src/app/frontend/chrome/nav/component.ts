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

import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDrawer} from '@angular/material';
import {NavService} from '../../common/services/nav/service';
import {TenantService} from 'common/services/global/tenant';

@Component({
  selector: 'kd-nav',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class NavComponent implements OnInit {
  @ViewChild(MatDrawer, {static: true}) private readonly nav_: MatDrawer;
  showCluster:boolean=true;
  showTenant:boolean=true;
  showUser:boolean=true;

  constructor(
    private readonly navService_: NavService,
    private readonly tenantService_: TenantService,
  ) {
    const usertype = sessionStorage.getItem('type');//added

    if(usertype=='cluster-admin'){
      this.showCluster=this.showCluster;
      this.showTenant=this.showTenant;
      this.showUser=this.showUser;
    }

    else if(usertype=='tenant-admin'){
      this.showCluster=!this.showCluster;
      this.showTenant=this.showTenant;
      this.showUser=this.showUser;
    }

    else{
      this.showCluster=!this.showCluster;
      this.showTenant=!this.showTenant;
      this.showUser=!this.showUser;
    }
  }

  get isSystem(): boolean {
    return this.tenantService_.isSystem();
  }

  get isCurrentSystem(): boolean {
    return this.tenantService_.isCurrentSystem();
  }

  ngOnInit(): void {
    this.navService_.setNav(this.nav_);
    this.navService_.setVisibility(true);
  }
}
