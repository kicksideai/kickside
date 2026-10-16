# Production overrides for the prod-gen2 EKS deploy. Template rendered by
# `envsubst` in Deploy_to_PROD_GEN2_EKS — nothing hardcoded in the repo.
#
# Target: namespace wippy-production at kickside.wippy.ai (internal ALB,
# NetBird-only access).

ingress:
  host: ${INGRESS_HOST}
  certificateArn: ${INGRESS_CERT_ARN}
  inboundCidrs: ${INGRESS_INBOUND_CIDRS}

replicaCount: 1
