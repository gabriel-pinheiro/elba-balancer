mock "PUT /retry-expect-body/reset" {
    body = "{{setFlag 'shouldExpectBodyFail' true}}"
}
mock "POST /retry-expect-body" {
    body = <<EOF
        {{#hasFlag 'shouldExpectBodyFail'}}
            {{delFlag 'shouldExpectBodyFail'}}
            {{setStatus 503}}
        {{else eq request.body.foo 'bar'}}
            {{setStatus 204}}
        {{else}}
            {{setStatus 500}}
        {{/hasFlag}}
    EOF
}

mock "PUT /retry-expect-header/reset" {
    body = "{{setFlag 'shouldExpectHeaderFail' true}}"
}
mock "GET /retry-expect-header" {
    body = <<EOF
        {{#hasFlag 'shouldExpectHeaderFail'}}
            {{delFlag 'shouldExpectHeaderFail'}}
            {{setStatus 503}}
        {{else eq request.headers.x-foo 'bar'}}
            {{setStatus 204}}
        {{else}}
            {{setStatus 500}}
        {{/hasFlag}}
    EOF
}
