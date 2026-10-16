# KickSide Self Reflection

Optional read-only agent capability for registry/app introspection.

The host supplies two security scopes. `admin_scope` grants execution of the
Self Reflection tool. `forbid_scope` names the host scope without Self
Reflection discovery; it receives no grant. Registry discovery follows the
caller's groups: the `module_access` bundle that default Members compose covers
only the package's own namespaces, and the trait and tool come from the
optional `tool_access` policy an administrator adds to a group. A user's scope
is the union of their groups, so administrators keep discovery while sharing
the user scope.
