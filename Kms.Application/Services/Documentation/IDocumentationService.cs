using Common.OperationResult;
using Kms.Application.ViewModels;
using Kms.Domain.Entities.UnitDocumentation;

namespace Kms.Application.Services.Documentation;

public interface IDocumentationService
{
    Task<OperationResult<List<UnitDocumentationViewModel>>> GetUnitDocumentation(GetDocumentationTypesEnum documentationFilter, string? searchText, int? pageNo = null);
    Task<OperationResult<UnitDocumentationViewModel>> CreateUnitDocumentation(CreateUnitDocumentationViewModel unitDocumentation);
    Task<OperationResult<UnitResponsibleViewModel>> AddUnitResponsible(UnitResponsibleViewModel model); 
    Task<OperationResult<UnitDocumentationViewModel>> AcceptDocumentation(AcceptDocumentationViewModel model);
    Task<OperationResult<List<PositionViewModel>>> GetAllPositions();
    Task<OperationResult<List<PositionViewModel>>> GetCurrentUserPositionsForDepartment();
    Task<OperationResult<PositionViewModel>> AddPosition(CreatePositionViewModel model);
    Task<OperationResult<List<SubstituteViewModel>>> AddSubstituteForUnit(CreateSubstituteViewModel model);
    Task<OperationResult<List<SubstituteViewModel>>> GetSubstitutesDepartment();

    Task<OperationResult<PositionViewModel>> DeletePosition(int positionId);
    Task<OperationResult<SubstituteViewModel>> DeleteSubstitute(int substituteId);
}