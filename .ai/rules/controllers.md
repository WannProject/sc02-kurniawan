---
paths:
  - 'app/Http/Controllers/**'
---

# Controllers

## Resolve single resources for Inertia object props
When an Inertia React page prop is typed as a direct object, resolve single JsonResource instances in the controller, e.g. `(new TicketResource($model))->resolve($request)`. Otherwise the browser can receive a wrapped resource shape and crash when React reads nested fields like `ticket.status.value`.
