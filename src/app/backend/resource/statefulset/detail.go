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

package statefulset

import (
	"log"

	"github.com/CentaurusInfra/dashboard/src/app/backend/errors"
	metricapi "github.com/CentaurusInfra/dashboard/src/app/backend/integration/metric/api"
	"github.com/CentaurusInfra/dashboard/src/app/backend/resource/common"
	apps "k8s.io/api/apps/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// StatefulSetDetail is a presentation layer view of Kubernetes Stateful Set resource. This means it is Stateful
type StatefulSetDetail struct {
	// Extends list item structure.
	StatefulSet `json:",inline"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetStatefulSetDetail gets Stateful Set details.
func GetStatefulSetDetail(client kubernetes.Interface, metricClient metricapi.MetricClient, namespace,
	name string) (*StatefulSetDetail, error) {
	log.Printf("Getting details of %s statefulset in %s namespace", name, namespace)

	ss, err := client.AppsV1().StatefulSetsWithMultiTenancy(namespace, "").Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	podInfo, err := getStatefulSetPodInfo(client, ss)
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	ssDetail := getStatefulSetDetail(ss, podInfo, nonCriticalErrors)
	return &ssDetail, nil
}

// GetStatefulSetDetailWithMultiTenancy gets Stateful Set details.
func GetStatefulSetDetailWithMultiTenancy(client kubernetes.Interface, metricClient metricapi.MetricClient, tenant, namespace,
	name string) (*StatefulSetDetail, error) {
	log.Printf("Getting details of %s statefulset in %s namespace for %s", name, namespace, tenant)

	ss, err := client.AppsV1().StatefulSetsWithMultiTenancy(namespace, tenant).Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	podInfo, err := getStatefulSetPodInfoWithMultiTenancy(client, tenant, ss)
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	ssDetail := getStatefulSetDetail(ss, podInfo, nonCriticalErrors)
	return &ssDetail, nil
}

func getStatefulSetDetail(statefulSet *apps.StatefulSet, podInfo *common.PodInfo, nonCriticalErrors []error) StatefulSetDetail {
	return StatefulSetDetail{
		StatefulSet: toStatefulSet(statefulSet, podInfo),
		Errors:      nonCriticalErrors,
	}
}
