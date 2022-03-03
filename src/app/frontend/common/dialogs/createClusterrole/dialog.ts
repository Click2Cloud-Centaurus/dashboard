
import {Component,Inject,OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AbstractControl, Validators,FormBuilder} from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import {CONFIG} from "../../../index.config";
import {CsrfTokenService} from "../../services/global/csrftoken";

// @ts-ignore
import Swal from "sweetalert2/dist/sweetalert2.js";


export interface CreateClusterroleDialogMeta {
  name: string;
  apiGroups: string []
  resources: string[]
  verbs: string[]
}

@Component({
  selector: 'kd-create-clusterrole-dialog',
  templateUrl: 'template.html',
})

export class CreateClusterroleDialog implements OnInit {
  form1: FormGroup;
  private readonly config_ = CONFIG;

  ClusterroleMaxLength = 24;
  ClusterrolePattern: RegExp = new RegExp('^[a-z0-9]([-a-z0-9]*[a-z0-9])?$');

  ApigroupsMaxLength = 63;
  ApigroupsPattern:  RegExp = new RegExp('^[a-z\\a-z\\d_@.#$=!%^)(\\]:\\*;\\?\\/\\,}{\'\\|<>\\[&\\+-]*$');

  ResourceMaxLength = 63;
  ResourcePattern: RegExp = new RegExp('^^[a-z\\a-z\\d_@.#$=!%^)(\\]:\\*;\\?\\/\\,}{\'\\|<>\\[&\\+-]*$');

  VerbsMaxLength = 63;
  VerbsPattern: RegExp = new RegExp('^^[a-z\\a-z\\d_@.#$=!%^)(\\]:\\*;\\?\\/\\,}{\'\\|<>\\[&\\+-]*$');

  name: string
  apigroup: string[]
  resource: string[]
  verb : string[]

  constructor(
    public dialogRef: MatDialogRef<CreateClusterroleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CreateClusterroleDialogMeta,
    private readonly http_: HttpClient,
    private readonly csrfToken_: CsrfTokenService,
    private readonly matDialog_: MatDialog,
    private readonly fb_: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form1 = this.fb_.group({
      clusterrole: [
        '',
        Validators.compose([
          Validators.maxLength(this.ClusterroleMaxLength),
          Validators.pattern(this.ClusterrolePattern),
        ]),
      ],
      apigroups: [
        '',
        Validators.compose([
          Validators.maxLength(this.ApigroupsMaxLength),
          Validators.pattern(this.ApigroupsPattern),
        ]),
      ],
      resources: [
        '',
        Validators.compose([
          Validators.maxLength(this.ResourceMaxLength),
          Validators.pattern(this.ResourcePattern),
        ]),
      ],
      verbs: [
        '',
        Validators.compose([
          Validators.maxLength(this.VerbsMaxLength),
          Validators.pattern(this.VerbsPattern),
        ]),
      ],
    });
  }

  get clusterrole(): AbstractControl {
    return this.form1.get('clusterrole');
  }
  get apigroups(): AbstractControl {
    return this.form1.get('apigroups');
  }
  get verbs(): AbstractControl {
    return this.form1.get('verbs');
  }
  get resources(): AbstractControl {
    return this.form1.get('resources');
  }

  // function for creating new Clusterrole
  createclusterrole(): void {
    if (!this.form1.valid) return;
    this.apigroup = this.apigroups.value.split(',')
    this.resource = this.resources.value.split(',')
    this.verb = this.verbs.value.split(',')

    const clusterroleSpec= {name: this.clusterrole.value,apiGroups: this.apigroup,verbs: this.verb,resources: this.resource};
    const tokenPromise = this.csrfToken_.getTokenForAction('system','clusterrole');
    tokenPromise.subscribe(csrfToken => {
      return this.http_
        .post<{valid: boolean}>(
          'api/v1/clusterrole',
          {...clusterroleSpec},
          {
            headers: new HttpHeaders().set(this.config_.csrfHeaderName, csrfToken.token),
          },
        )
        .subscribe(
          () => {
            Swal.fire({
              type: 'success',
              title: this.clusterrole.value,
              text: 'clusterrole successfully created!',
              imageUrl: '/assets/images/tick-circle.svg',
            })
            this.dialogRef.close(this.clusterrole.value);

          },
          (error:any) => {
            if (error) {
              Swal.fire({
                type:'error',
                title: this.clusterrole.value,
                text: 'clusterrole already exists!',
                imageUrl: '/assets/images/close-circle.svg',
              })
            }
          },
        );
    });
  }

  isDisabled(): boolean {
    return this.data.name.indexOf(this.clusterrole.value) >= 0;
  }
  cancel(): void {
    this.dialogRef.close();
  }

}
