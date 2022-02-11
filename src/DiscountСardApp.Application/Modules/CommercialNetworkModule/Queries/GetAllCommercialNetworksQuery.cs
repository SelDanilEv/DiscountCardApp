﻿using AutoMapper;
using DiscountСardApp.Application.Models.V1.CommercialNetwork.Results;
using DiscountСardApp.Infrastructure.Contexts;
using FluentValidation;
using MediatR;

namespace DiscountСardApp.Application.Modules.CommercialNetworkModule.Queries
{
    public sealed class GetAllCommercialNetworksQuery : IRequest<List<CommercialNetworkResult>>
    {
    }

    public sealed class GetAllCommercialNetworksQueryValidator : AbstractValidator<GetAllCommercialNetworksQuery>
    {
        public GetAllCommercialNetworksQueryValidator()
        {
        }
    }

    public sealed class GetAllCommercialNetworksQueryHandler : BaseModuleHandler<GetAllCommercialNetworksQuery, List<CommercialNetworkResult>>
    {
        public GetAllCommercialNetworksQueryHandler(ApplicationDbContext dbContext, IMapper mapper) : base(dbContext, mapper) { }

        public override async Task<List<CommercialNetworkResult>> Handle(GetAllCommercialNetworksQuery request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
            //return await _CommercialNetworkService.GetAll();
        }
    }
}
