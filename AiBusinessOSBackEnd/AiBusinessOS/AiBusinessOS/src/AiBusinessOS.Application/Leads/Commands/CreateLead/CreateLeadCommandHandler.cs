using AiBusinessOS.Application.Abstractions;
using AiBusinessOS.Domain.Entities;
using MediatR;

namespace AiBusinessOS.Application.Leads.Commands.CreateLead;

public sealed class CreateLeadCommandHandler(
    ILeadRepository leadRepository,
    ICurrentTenant currentTenant,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateLeadCommand, Guid>
{
    public async Task<Guid> Handle(CreateLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = new Lead
        {
            Id = Guid.NewGuid(),
            TenantId = currentTenant.TenantId,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName?.Trim(),
            Email = request.Email?.Trim(),
            Phone = request.Phone?.Trim(),
            Source = request.Source.Trim(),
            CompanyName = request.CompanyName?.Trim(),
            Status = "open",
            Score = 0,
            ValueEstimate = 0,
            CreatedBy = currentTenant.UserId
        };

        await leadRepository.AddAsync(lead, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return lead.Id;
    }
}
