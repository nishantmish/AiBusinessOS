using FluentValidation;

namespace AiBusinessOS.Application.Leads.Commands.CreateLead;

public sealed class CreateLeadCommandValidator : AbstractValidator<CreateLeadCommand>
{
    public CreateLeadCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Source).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Email).MaximumLength(255);
        RuleFor(x => x.Phone).MaximumLength(30);
    }
}
