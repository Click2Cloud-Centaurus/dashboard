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

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {AlertDialog, AlertDialogConfig} from '../../../../common/dialogs/alert/dialog';
import {CsrfTokenService} from '../../../../common/services/global/csrftoken';
import {CONFIG} from '../../../../index.config';

export interface CreateSecretDialogMeta {
  namespace: string;
}

@Component({
  selector: 'kd-create-secret-dialog',
  templateUrl: 'template.html',
})
export class CreateSecretDialog implements OnInit {
  form: FormGroup;

  private readonly config_ = CONFIG;

  /**
   * Max-length validation rule for secretName.
   */
  secretNameMaxLength = 253;

  /**
   * Pattern validation rule for secretName.
   */
  secretNamePattern = new RegExp(
    '^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$',
  );

  /**
   * Pattern validating if the secret data is Base64 encoded.
   */
  dataPattern = new RegExp('^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$');

  constructor(
    public dialogRef: MatDialogRef<CreateSecretDialog>,
    @Inject(MAT_DIALOG_DATA) public data_: CreateSecretDialogMeta,
    private readonly http_: HttpClient,
    private readonly csrfToken_: CsrfTokenService,
    private readonly matDialog_: MatDialog,
    private readonly fb_: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form = this.fb_.group({
      secretName: [
        '',
        Validators.compose([
          Validators.maxLength(this.secretNameMaxLength),
          Validators.pattern(this.secretNamePattern),
        ]),
      ],
      data: ['', Validators.pattern(this.dataPattern)],
    });
  }

  get secretName(): AbstractControl {
    return this.form.get('secretName');
  }

  get data(): AbstractControl {
    return this.form.get('data');
  }

  /**
   * Creates new secret based on the state of the controller.
   */
  createSecret(): void {
    if (!this.form.valid) return;

    const secretSpec = {
      name: this.secretName.value,
      namespace: this.data_.namespace,
      data: this.data.value,
    };

    const tokenPromise = this.csrfToken_.getTokenForAction('system','secret');
    tokenPromise.subscribe(csrfToken => {
      return this.http_
        .post<{valid: boolean}>(
          'api/v1/secret/',
          {...secretSpec},
          {
            headers: new HttpHeaders().set(this.config_.csrfHeaderName, csrfToken.token),
          },
        )
        .subscribe(
          () => {
            // this.log_.info('Successfully created namespace:', savedConfig);
            this.dialogRef.close(this.secretName.value);
          },
          error => {
            // this.log_.info('Error creating namespace:', err);
            this.dialogRef.close();
            const configData: AlertDialogConfig = {
              title: 'Error creating secret',
              message: error.data,
              confirmLabel: 'OK',
            };
            this.matDialog_.open(AlertDialog, {data: configData});
          },
        );
    });
  }

  /**
   * Cancels the create secret form.
   */
  cancel(): void {
    this.dialogRef.close();
  }
}
