mock "POST /expect-body" {
  body = <<EOF
    {{#eq request.body.foo 'bar'}}
      {{setStatus 204}}
    {{else}}
      {{setStatus 500}}
    {{/eq}}
  EOF
}

mock "GET /expect-query" {
  body = <<EOF
    {{#eq request.query.foo 'bar'}}
      {{setStatus 204}}
    {{else}}
      {{setStatus 500}}
    {{/eq}}
  EOF
}

mock "GET /expect-header" {
  body = <<EOF
    {{#eq request.headers.x-foo 'bar'}}
      {{setStatus 204}}
    {{else}}
      {{setStatus 500}}
    {{/eq}}
  EOF
}

mock "GET /return-body" {
  headers {
    Content-Type = "application/json"
  }

  body = <<EOF
  {
    "foo": "bar"
  }
  EOF
}

mock "GET /return-header" {
  headers {
    X-Foo = "bar"
  }
}

mock "GET /return-host" {
  body = "{{ request.headers.host }}"
}
