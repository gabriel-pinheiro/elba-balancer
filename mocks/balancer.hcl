mock "GET /{any}/success" {
    status = 204
}


mock "PUT /{any}/balancer-1/reset" {
    body = "{{setFlag 'bal1:reqcount' 0}}"
}
mock "GET /v1/balancer-1" {
    status = 503
    body = "{{setFlag 'bal1:reqcount' (add (getFlag 'bal1:reqcount') 1)}}"
}
mock "GET /{any}/balancer-1" {
    status = 204
}
mock "GET /{any}/balancer-1/status" {
    headers {
        Content-Type = "application/json"
    }

    body = "{{getFlag 'bal1:reqcount'}}"
}

mock "GET /v1/balancer-2" {
    status = 503
}
mock "GET /{any}/balancer-2" {
    status = 204
}

mock "PUT /{any}/balancer-3/reset" {
    body = "{{setFlag 'bal3:reqcount' 0}}"
}
mock "GET /v1/balancer-3" {
    status = 503
    body = <<EOF
        {{setFlag 'bal3:reqcount' (add (getFlag 'bal3:reqcount') 1)}}
        {{#eq (getFlag 'bal3:reqcount') 3}}
            {{setStatus 204}}
        {{/eq}}
    EOF
}
mock "GET /{any}/balancer-3" {
    status = 204
}
mock "GET /{any}/balancer-3/status" {
    headers {
        Content-Type = "application/json"
    }

    body = "{{getFlag 'bal3:reqcount'}}"
}

mock "PUT /{any}/balancer-4/reset" {
    body = "{{setFlag 'bal4:reqcount' 0}}"
}
mock "GET /v1/balancer-4" {
    status = 503
    body = "{{setFlag 'bal4:reqcount' (add (getFlag 'bal4:reqcount') 1)}}"
}
mock "GET /{any}/balancer-4" {
    status = 204
}
mock "GET /{any}/balancer-4/status" {
    headers {
        Content-Type = "application/json"
    }

    body = "{{getFlag 'bal4:reqcount'}}"
}

mock "GET /{any}/fail500" {
    status = 500
}
