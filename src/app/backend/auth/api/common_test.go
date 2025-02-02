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

package api

import (
	"reflect"
	"testing"
)

func TestToAuthenticationModes(t *testing.T) {
	cases := []struct {
		modes    []string
		expected AuthenticationModes
	}{
		{[]string{}, AuthenticationModes{}},
		{[]string{"token"}, AuthenticationModes{Token: true}},
		{[]string{"token", "basic", "test"}, AuthenticationModes{Token: true, Basic: true}},
	}

	for _, c := range cases {
		got := ToAuthenticationModes(c.modes)
		if !reflect.DeepEqual(got, c.expected) {
			t.Fatalf("ToAuthenticationModes(): expected %v, but got %v", c.expected, got)
		}
	}
}

func TestShouldRejectRequest(t *testing.T) {
	cases := []struct {
		url      string
		expected bool
	}{
		{"#!/namespace?namespace=test", false},
		{"#!/namespace/test", false},
		{"#!/namespace?namespace=kube-system", false},
		{"#!/namespace/kube-system", false},
		{"#!/secret/test/test-secret?namespace=test", false},
		{"#!/secret/kube-system/test-secret", false},
		{"#!/secret/kube-system/centaurus-dashboard-key-holder", true},
		{"#!/secret/test/centaurus-dashboard-certs", true},
		{"#!/secret/kube-system/centaurus-dashboard-certs", true},
	}

	for _, c := range cases {
		got := ShouldRejectRequest(c.url)
		if !reflect.DeepEqual(got, c.expected) {
			t.Fatalf("ShouldRejectRequest(): url %s expected %v, but got %v", c.url, c.expected, got)
		}
	}
}
