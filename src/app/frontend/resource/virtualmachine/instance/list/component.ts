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

import {Component, ViewChild, OnInit} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

export interface PeriodicElement {
  name: any;
  image: any;
  keypair: any;
  status: string;
  state: string;
  time: any;

}

const ELEMENT_DATA: PeriodicElement[] = [
  {name: 'Instance1', image: 'demo-vm', keypair: 'demo-keypair', status: 'Running', state: 'Ready', time: '1 week, 5 days'},
  {name: 'Instance2', image: 'demo-vm4', keypair: 'test-keypair', status: 'Error', state: 'No State', time: '2 week, 5 days'},
  {name: 'Instance3', image: 'demo-vm2', keypair: 'test-keypair2', status: 'Running', state: 'Ready', time: '3 week, 5 days'},
  {name: 'Instance4', image: 'demo-vm4', keypair: 'demo-keypair2', status: 'Stop', state: 'Not Ready', time: '1 week, 5 days'},
  {name: 'Instance5', image: 'demo-vm6', keypair: 'demo-keypair4', status: 'Running', state: 'Ready', time: '2 week, 5 days'},
  {name: 'Instance6', image: 'demo-vm9', keypair: 'test-keypair4', status: 'Running', state: 'Ready', time: '2 week, 5 days'},
  {name: 'Instance7', image: 'demo-vm1', keypair: 'demo-keypair2', status: 'Running', state: 'Ready', time: '2 week, 5 days'},
  {name: 'Instance8', image: 'demo-vm6', keypair: 'test-keypair3', status: 'Running', state: 'Ready', time: '2 week, 5 days'},
  {name: 'Instance9', image: 'demo-vm3', keypair: 'demo-keypair5', status: 'Running', state: 'Ready', time: '2 week, 5 days'},
  {name: 'Instance10', image: 'demo-vm2', keypair: 'test-keypair1', status: 'Running', state: 'Ready', time: '2 week, 5 days'},
  {name: 'Instance11', image: 'demo-vm1', keypair: 'demo-keypair4', status: 'Running', state: 'Ready', time: '2 week, 5 days'},
  {name: 'Instance12', image: 'demo-vm7', keypair: 'test-keypair3', status: 'Running', state: 'Ready', time: '2 week, 5 days'},
];

@Component({
  selector: 'kd-instance-list',
  templateUrl: './template.html',
})

export class InstanceListComponent implements  OnInit{

  panelOpenState = false;
  displayedColumns: string[] = ['select', 'name', 'image', 'keypair', 'status', 'state', 'time', 'action'];
  // dataSource = ELEMENT_DATA;
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}

