mock "PUT /{any}/fail-succeed/{num}/reset" {
    body = "{{setFlag (append 'failSucceed:' request.params.num) true}}"
}

mock "GET /{any}/fail-succeed/{num}" {
    body = <<EOF
        {{#hasFlag (append 'failSucceed:' request.params.num)}}
            {{delFlag (append 'failSucceed:' request.params.num)}}
            {{setStatus 503}}
        {{/hasFlag}}
    EOF
}

mock "GET /{any}/fail" {
    status = 503
    
    headers {
        Content-Type = "application/json"
    }

    body = <<EOF
    {
      "failed": "yup"
    }
    EOF
}

mock "GET /success" {
    status = 204
}
