local links=require("links")
return {read=function(args)
    local scalar,scalar_err=links.resolve(args.provider,args.external_id)
    local link,link_err=links.resolve_link(args.provider,args.external_id)
    local restriction,restriction_err=links.link_get(args.link_id)
    return {scalar=scalar,scalar_err=scalar_err,link=link,link_err=link_err,
        restriction=restriction,restriction_err=restriction_err}
end}
