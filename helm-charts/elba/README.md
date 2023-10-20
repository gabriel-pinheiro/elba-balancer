# ELBA HELM CHART

![Version: 1.0.1](https://img.shields.io/badge/Version-1.0.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 1.3.0](https://img.shields.io/badge/AppVersion-1.3.0-informational?style=flat-square)

A Load balancer with retries

# Requirements

- helm: `3.x`

# Input Variables

<table>
  <thead>
    <th>Key</th>
    <th>Description</th>
    <th>Type</th>
    <th>Default</th>
  </thead>
  <tbody>
    <tr>
      <td id="affinity"><a href="./values.yaml#L63">affinity</a></td>
      <td></td>
      <td>
object
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
{}
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="elbaConfig"><a href="./values.yaml#L5">elbaConfig</a></td>
      <td>it uses YAML and converts to TOML</td>
      <td>
string
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
null
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="fullnameOverride"><a href="./values.yaml#L45">fullnameOverride</a></td>
      <td></td>
      <td>
string
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
""
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="image--pullPolicy"><a href="./values.yaml#L39">image.pullPolicy</a></td>
      <td></td>
      <td>
string
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
"IfNotPresent"
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="image--repository"><a href="./values.yaml#L38">image.repository</a></td>
      <td></td>
      <td>
string
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
"gabrielctpinheiro/elba"
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="image--tag"><a href="./values.yaml#L41">image.tag</a></td>
      <td></td>
      <td>
string
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
""
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="imagePullSecrets"><a href="./values.yaml#L43">imagePullSecrets</a></td>
      <td></td>
      <td>
list
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
[]
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="nameOverride"><a href="./values.yaml#L44">nameOverride</a></td>
      <td></td>
      <td>
string
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
""
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="nodeSelector"><a href="./values.yaml#L59">nodeSelector</a></td>
      <td></td>
      <td>
object
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
{}
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="podAnnotations--"prometheus--io/path""><a href="./values.yaml#L67">podAnnotations."prometheus.io/path"</a></td>
      <td></td>
      <td>
string
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
"/__elba__/metrics"
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="podAnnotations--"prometheus--io/port""><a href="./values.yaml#L68">podAnnotations."prometheus.io/port"</a></td>
      <td></td>
      <td>
string
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
"8080"
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="podAnnotations--"prometheus--io/scrape""><a href="./values.yaml#L66">podAnnotations."prometheus.io/scrape"</a></td>
      <td></td>
      <td>
string
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
"true"
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="podSecurityContext"><a href="./values.yaml#L70">podSecurityContext</a></td>
      <td></td>
      <td>
object
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
{}
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="replicaCount"><a href="./values.yaml#L1">replicaCount</a></td>
      <td></td>
      <td>
int
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
1
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="resources"><a href="./values.yaml#L51">resources</a></td>
      <td></td>
      <td>
object
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
{}
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="securityContext"><a href="./values.yaml#L73">securityContext</a></td>
      <td></td>
      <td>
object
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
{}
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="service--port"><a href="./values.yaml#L49">service.port</a></td>
      <td></td>
      <td>
int
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
8080
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="service--type"><a href="./values.yaml#L48">service.type</a></td>
      <td></td>
      <td>
string
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
"ClusterIP"
</pre>
</div>
      </td>
    </tr>
    <tr>
      <td id="tolerations"><a href="./values.yaml#L61">tolerations</a></td>
      <td></td>
      <td>
list
</td>
      <td>
        <div style="max-width: 300px;"><pre lang="json">
[]
</pre>
</div>
      </td>
    </tr>
  </tbody>
</table>

