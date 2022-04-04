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

import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {SEARCH_QUERY_STATE_PARAM} from '../../common/params/params';
import {ParamsService} from '../../common/services/global/params';
import {LocalSettings} from '@api/backendapi';
import {LocalSettingsService} from '../../common/services/global/localsettings';

@Component({
  selector: 'kd-search',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class SearchComponent implements OnInit {
  query: string;
  settings: LocalSettings = {} as LocalSettings;
  constructor(
    private readonly router_: Router,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly paramsService_: ParamsService,
    private readonly settings_: LocalSettingsService
  ) {}

  ngOnInit(): void {
    this.activatedRoute_.queryParamMap.subscribe(paramMap => {
      this.query = paramMap.get(SEARCH_QUERY_STATE_PARAM);
      this.paramsService_.setQueryParam(SEARCH_QUERY_STATE_PARAM, this.query);
      this.settings = this.settings_.get();
    });
  }

  submit(form: NgForm): void {
    if (form.valid) {
      this.router_.navigate(['search'], {
        queryParamsHandling: 'merge',
        queryParams: {[SEARCH_QUERY_STATE_PARAM]: this.query},
      });
    }
  }

  onThemeChange(): void {
    this.settings_.handleThemeChange(this.settings.isThemeDark);
  }
}
