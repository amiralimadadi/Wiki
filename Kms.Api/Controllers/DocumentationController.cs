using Kms.Application.Services.Documentation;
using Kms.Application.Services.General;
using Kms.Application.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Kms.Api.Controllers
{
    /// <summary>
    /// Definition of units and the archive of their documents.
    /// </summary>
    public class DocumentationController : KmsBaseController
    {
        private readonly IGeneralService _generalService;
        private readonly IDocumentationService _documentationService;

        public DocumentationController(IGeneralService generalService, IDocumentationService documentationService)
        {
            _generalService = generalService;
            _documentationService = documentationService;
        }


        /// <summary>
        /// Create Unit Documentation
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateUnitDocumentation([FromForm] CreateUnitDocumentationViewModel vm)
        {
            var result = await _documentationService.CreateUnitDocumentation(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Get Unit Documentation
        /// </summary>
        /// <param name="documentationFilter"></param>
        /// <param name="searchText"></param>
        /// <param name="unitId"></param>
        /// <param name="pageNo"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetUnitDocumentation(GetDocumentationTypesEnum documentationFilter, string? searchText, int pageNo = 1)
        {
            var result = await _documentationService.GetUnitDocumentation(documentationFilter, searchText,  pageNo);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AcceptDocumentation([FromForm] AcceptDocumentationViewModel model)
        {
            var result = await _documentationService.AcceptDocumentation(model);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Get All Units
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetAllUnits()
        {
            var result = await _generalService.GetAllUnits();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Create Unit
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AddUnit([FromForm] UnitViewModel vm)
        {
            var result = await _generalService.AddUnit(vm);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Add Unit Responsible
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AddUnitResponsible([FromForm] UnitResponsibleViewModel vm)
        {
            var result = await _documentationService.AddUnitResponsible(vm);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Create Positions
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AddPosition([FromForm] CreatePositionViewModel vm)
        {
            var result = await _documentationService.AddPosition(vm);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Get All Positions
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetAllPositions()
        {
            var result = await _documentationService.GetAllPositions();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Get Current User Positions For Department
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetPositionsForCurrentDepartment()
        {
            var result = await _documentationService.GetCurrentUserPositionsForDepartment();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Delete Position
        /// </summary>
        /// <param name="positionId"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> DeletePosition(int positionId)
        {
            var result = await _documentationService.DeletePosition(positionId);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }
        

        /// <summary>
        /// Add a user to Substitute a department
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AddSubstituteToDepartment([FromForm] CreateSubstituteViewModel vm)
        {
            var result = await _documentationService.AddSubstituteForUnit(vm);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        ///Get List of substitutes of the department
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetSubstitutesDepartment()
        {
            var result = await _documentationService.GetSubstitutesDepartment();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Delete Substitute
        /// </summary>
        /// <param name="substituteId"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> DeleteSubstitute(int substituteId)
        {
            var result = await _documentationService.DeleteSubstitute(substituteId);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }









    }
}
