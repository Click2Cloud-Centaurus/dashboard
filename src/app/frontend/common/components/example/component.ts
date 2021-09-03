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
import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil, startWith, switchMap} from 'rxjs/operators';
import {MatSelect} from '@angular/material';
import {TenantList} from '@api/backendapi';
import {TENANT_STATE_PARAM, NAMESPACE_STATE_PARAM} from '../../params/params';
import {TenantService} from '../../services/global/tenant';
import {ResourceService} from 'common/services/resource/resource';
import {EndpointManager, Resource} from 'common/services/resource/endpoint';
import {NotificationsService, NotificationSeverity} from 'common/services/global/notifications';
import {CONFIG} from 'index.config';
@Component({
  selector: 'kd-example-selector',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class ExampleComponent{

  constructor(
  ) {}

}

