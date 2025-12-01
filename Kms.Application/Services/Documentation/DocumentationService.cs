using AutoMapper;
using Common.File;
using Common.OperationResult;
using Common.Paging;
using Kms.Application.Senders;
using Kms.Application.Services.Account;
using Kms.Application.Services.Gamifications;
using Kms.Application.Services.Units;
using Kms.Application.ViewModels;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.General;
using Kms.Domain.Entities.QuestionAndAnswer;
using Kms.Domain.Entities.UnitDocumentation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Kms.Application.Services.Documentation
{
    public class DocumentationService : IDocumentationService
    {
        private readonly IUnitRepository _unitRepository;
        private readonly IAccountService _accountService;
        private readonly IUnitService _unitService;
        private readonly IUserRepository _userRepository;
        private readonly IGamificationService _gamificationService;
        private readonly IUnitResponsibleRepository _unitResponsibleRepository;
        private readonly IUnitDocumentationRepository _unitDocumentationRepository;
        private readonly IPositionRepository _positionRepository;
        private readonly IUnitAttachmentRepository _unitAttachmentRepository;
        private readonly IUnitSubstituteRepository _unitSubstituteRepository;
        private readonly IUnitDocumentationTagRepository _unitDocumentationTagRepository;
        private readonly ITagRepository _tagRepository;
        private readonly INotificationSender _notificationSender;
        private readonly FileSettings _fileSettings;
        private readonly PagingOptions _pagingOptions;
        private readonly IMapper _mapper;

        #region Constructor

        public DocumentationService(
            IUnitRepository unitRepository,
            IAccountService accountService,
            IUnitService unitService,
            IUserRepository userRepository,
            IPositionRepository positionRepository,
            IUnitSubstituteRepository unitSubstituteRepository,
            IUnitResponsibleRepository unitResponsibleRepository,
            INotificationSender notificationSender,
            IUnitDocumentationRepository unitDocumentationRepository,
            IUnitAttachmentRepository unitAttachmentRepository,
            IUnitDocumentationTagRepository unitDocumentationTagRepository,
            IGamificationService gamificationService,
            ITagRepository tagRepository,
            IOptions<FileSettings> fileSettings,
            IOptions<PagingOptions> pagingOptions,
            IMapper mapper
        )
        {
            _unitRepository = unitRepository;
            _accountService = accountService;
            _unitService = unitService;
            _userRepository = userRepository;
            _gamificationService = gamificationService;
            _notificationSender = notificationSender;
            _unitSubstituteRepository = unitSubstituteRepository;
            _positionRepository = positionRepository;
            _unitResponsibleRepository = unitResponsibleRepository;
            _unitDocumentationRepository = unitDocumentationRepository;
            _unitAttachmentRepository = unitAttachmentRepository;
            _unitDocumentationTagRepository = unitDocumentationTagRepository;
            _tagRepository = tagRepository;
            _fileSettings = fileSettings.Value;
            _pagingOptions = pagingOptions.Value;
            _mapper = mapper;
        }

        #endregion

        #region Private Methods

        private bool ValidateDocumentation(UnitDocumentation documentation, out UnitDocumentation finaldocumentation, out List<ModelError> modelErrors, int unitId, List<string> tags)
        {
            modelErrors = new List<ModelError>();
            finaldocumentation = documentation;

            _unitDocumentationRepository.EntityValidation(finaldocumentation, out List<ModelError> errors);

            if (documentation == null)
            {
                modelErrors.Add(new ModelError(nameof(documentation), "اطلاعات  به درستی پر نشده است"));
                return false;
            }


            if (string.IsNullOrWhiteSpace(documentation.Text))
            {
                errors.Add(new ModelError(nameof(documentation.Text), "متن اجباری است"));
            }
            if (unitId <= 0)
            {
                modelErrors.Add(new ModelError(nameof(unitId), "یک واحد معتبر انتخاب شود"));
            }

            if (string.IsNullOrWhiteSpace(documentation.Title))
                errors.Add(new ModelError(nameof(documentation.Title), "عنوان اجباری است"));

            if (!tags.Any())
                errors.Add(new ModelError(nameof(tags), "کلمات کلیدی اجباری است"));


            _unitDocumentationRepository.EntityValidation(finaldocumentation, out var validationErrors);
            if (validationErrors.Any())
            {
                modelErrors.AddRange(validationErrors);
            }

            return !modelErrors.Any();
        }


        #endregion


        #region Documentation

        public async Task<OperationResult<UnitDocumentationViewModel>> CreateUnitDocumentation(
            CreateUnitDocumentationViewModel unitDocumentation)
        {
            var tempDocumentation = _mapper.Map<UnitDocumentation>(unitDocumentation);
            var errors = new List<ModelError>();


            var userId = _accountService.GetUserId();
            var getUnitIdByUserId = await _unitService.GetIgtUnitIdByUserId(userId);
            if (getUnitIdByUserId == -1)
            {
                return new OperationResult<UnitDocumentationViewModel>(false, null, "اشکال در دریافت دپارتمان شما");
            }

            // Validate Documentation
            if (!ValidateDocumentation(tempDocumentation, out var finalDocumentation, out var validationErrors, getUnitIdByUserId, unitDocumentation.Tags))
            {
                errors.AddRange(validationErrors);
                return new OperationResult<UnitDocumentationViewModel>(false, null, "Documentation did not create.", errors);
            }

            // Validate Attachments
            if (unitDocumentation.DocumentationAttachments != null && unitDocumentation.DocumentationAttachments.Any())
            {
                var validation = await _unitAttachmentRepository.ValidateFile(unitDocumentation.DocumentationAttachments.First(), _fileSettings);
                if (!validation.IsSuccess)
                {
                    return new OperationResult<UnitDocumentationViewModel>(false, null, "Invalid file", validation.ModelErrors);
                }
            }

            var unit = await _unitRepository.GetEntityAsNoTracking()
                .FirstOrDefaultAsync(u => u.IgtDepartmentId == getUnitIdByUserId);

            if (unit == null)
            {
                try
                {
                    unit = await _unitService.InsertNewUnit(userId);
                }
                catch (Exception ex)
                {
                    errors.Add(new ModelError("UnitInsertionError", $"خطا در ایجاد واحد با شناسه {unitDocumentation.UnitId}: {ex.Message}"));
                    return new OperationResult<UnitDocumentationViewModel>(false, null, "خطا در ایجاد واحد.", errors);
                }
            }

            var position = await _positionRepository.GetEntityAsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == unitDocumentation.PositionId && p.UnitId == getUnitIdByUserId);

            if (position == null)
            {
                return new OperationResult<UnitDocumentationViewModel>(false, null, "سمت انتخاب شده با دپارتمان کاربر مطابقت ندارد.");
            }
            if (errors.Any())
            {
                return new OperationResult<UnitDocumentationViewModel>(false, null!, "خطایی رخ داده است", errors);
            }

            tempDocumentation.IsActive = false;

            //// Validate Units
            //var dbUnits = _unitRepository.GetEntity(u => unitDocumentation.UnitId == u.IgtDepartmentId).ToList();

            //if (!dbUnits.Any())
            //{
            //    errors.Add(new ModelError(nameof(unitDocumentation.UnitId), "Units not correctly selected."));
            //}

            // tags
            var tempTags = unitDocumentation.Tags.Select(s => s.Trim().Replace("#", "")).ToList();
            var existingTags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var existingTagTitles = existingTags.Select(t => t.TagTitle).ToList();
            var newTagTitles = tempTags.Except(existingTagTitles).ToList();

            if (newTagTitles.Any())
            {
                var newTags = newTagTitles.Select(tagTitle => new Tag { TagTitle = tagTitle }).ToList();
                await _tagRepository.AddRangeAsync(newTags, true);
                existingTags.AddRange(newTags);
            }

            // new UnitDocumentation
            var tempDoc = new UnitDocumentation
            {
                Text = unitDocumentation.Text,
                Title = unitDocumentation.Title,
                PositionId = unitDocumentation.PositionId,
                Position = unitDocumentation.Position,
                //PositionId = 35,
                UnitId = getUnitIdByUserId,
                UserId = _accountService.GetUserId(),

                IsActive = false
            };
            await _unitDocumentationRepository.AddAsync(tempDoc, true);

            // Save attachments if any
            if (unitDocumentation.DocumentationAttachments != null && unitDocumentation.DocumentationAttachments.Any())
            {
                await _unitAttachmentRepository.SaveAttachments(unitDocumentation.DocumentationAttachments, tempDoc.Id, _fileSettings);
            }

            var tags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var unitDocumentationTags = tags.Select(tag => new UnitDocumentationTag
            {
                EntityId = tempDoc.Id,
                TagId = tag.Id,
                CreatedUserId = _accountService.GetUserId().ToString(),
            }).ToList();
            await _unitDocumentationTagRepository.AddRangeAsync(unitDocumentationTags, true);
            var result = new UnitDocumentationViewModel
            {
                Id = tempDoc.Id,
                Title = tempDoc.Title,
                Position = _positionRepository.GetEntityAsNoTracking()
                    .FirstOrDefault(p => p.Id == tempDoc.PositionId)?.PositionName ?? "Unknown",
                Text = tempDoc.Text,
                Tags = tags.Select(tag => new TagsViewModel
                {
                    TagTitle = tag.TagTitle
                }).ToList(),
                Attachments = _unitAttachmentRepository.GetEntity(a => a.EntityId == tempDoc.Id)
                    .Select(a => new AttachmentViewModel
                    {
                        Id = a.Id,
                        Name = a.Name,
                        Address = a.Address
                    }).ToList(),
                User = new UserViewModel
                {
                    Id = tempDoc.UserId,
                    FullName = tempDoc.User.FullName
                }
            };
            var notificationStatus = _notificationSender.SendNotification(new SendNotificationDto()
            {
                Entity = tempDoc,
                NotificationType = NotificationTypeEnum.UnitDocumentationCreate,
                User = tempDoc.User,

            });

            return new OperationResult<UnitDocumentationViewModel>(true, result, "مدرک واحد با موفقیت ایجاد شد.");
            #endregion

        }

        public async Task<OperationResult<UnitResponsibleViewModel>> AddUnitResponsible(UnitResponsibleViewModel model)
        {
            var errors = new List<ModelError>();

            var existingUnit = await _unitResponsibleRepository.GetEntityAsNoTracking().
                FirstOrDefaultAsync(u => u.UnitId == model.UnitId && u.UserId == model.UserId);
            if (existingUnit != null)
            {
                return new OperationResult<UnitResponsibleViewModel>(false, null, "رکورد تکراری هست.");
            }



            var newUnitResponsible = new UnitResponsible()
            {
                UserId = model.UserId,
                UnitId = model.UnitId
            };

            await _unitResponsibleRepository.AddAsync(newUnitResponsible, true);



            var unitResponsibleViewModel = new UnitResponsibleViewModel()
            {
                UnitId = model.UnitId,
                UserId = model.UserId
            };
            return new OperationResult<UnitResponsibleViewModel>(true, unitResponsibleViewModel, "واحد مودر نظر با موفقیت ثبت شد");
        }

        public async Task<OperationResult<List<UnitDocumentationViewModel>>> GetUnitDocumentation(GetDocumentationTypesEnum documentationFilter, string? searchText, int? pageNo = null)
        {
            var userId = _accountService.GetUserId();

            #region Where

            var query = _unitDocumentationRepository.GetAllEntityAsNoTracking()
                .Include(d => d.Unit).AsQueryable();

            var departmentId = await _unitService.GetIgtUnitIdByUserId(userId);
            //var checkAdminForConfirm = false;
            //checkAdminForConfirm = userId== 1208;
            var checkAdminForConfirm = await _unitService.CheckIsManager(userId);

            query = documentationFilter switch
            {
                GetDocumentationTypesEnum.AllDocumentation => query.Where(d => d.IsActive && d.UnitId == departmentId),
                GetDocumentationTypesEnum.UnitDocumentation => query.Where(d =>
                    d.Unit.IgtDepartmentId == departmentId && d.IsActive),
                GetDocumentationTypesEnum.MyDocumentation => query.Where(d => d.UserId == userId),
                GetDocumentationTypesEnum.AwaitingConfirmation => query.Where(d => !d.IsActive
                    && checkAdminForConfirm && d.Unit.IgtDepartmentId == departmentId
                ),
                _ => query
            };

            if (searchText != null)
            {
                query = query.Where(a => EF.Functions.Like(a.Text, $"%{searchText}%")
                                         || EF.Functions.Like(a.Title, $"%{searchText}%"));
            }

            #endregion

            #region Paging and query populating

            var totalEntitiesCount = await query.CountAsync();
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore);

            query = _unitDocumentationRepository.AllAsNoTrackWithPagingAsync(paging, query)
                .Include(a => a.User)
                .Include(a => a.Unit)
                .Include(a => a.UnitPosition);
            var tempRes = await query.ToListAsync();
            var result = _mapper.Map<List<UnitDocumentationViewModel>>(tempRes);

            #endregion

            #region Descriptions

            var tempTagRep = (from q in _unitDocumentationTagRepository.GetEntityAsNoTracking()
                              where result.Select(r => r.Id).Contains(q.EntityId)
                              join t in _tagRepository.GetAllAsNoTrackAsync() on q.TagId equals t.Id
                              select new
                              {
                                  q.TagId,
                                  q.EntityId,
                                  t.TagTitle,
                                  q.CreatedUserId
                              }).ToList();

            var tempAttachmentRepo = _unitAttachmentRepository.GetEntityAsNoTracking()
                .Where(a => result.Select(r => r.Id).Contains(a.EntityId)).ToList();

            foreach (var res in result)
            {

                if (tempTagRep is { Count: > 0 })
                {
                    List<TagsViewModel> tempTagViewModels = (from t in tempTagRep.Where(a => a.EntityId == res.Id)
                                                             select new TagsViewModel
                                                             {
                                                                 TagTitle = t.TagTitle,
                                                                 CreatedUserId = t.CreatedUserId
                                                             }).ToList();
                    res.Tags = tempTagViewModels;
                }

                res.UnitName = tempRes.FirstOrDefault(d => d.Id == res.Id)?.Unit.UnitName;
                res.Position = tempRes.FirstOrDefault(d => d.PositionId == res.PositionId)?.UnitPosition.PositionName;

                res.Attachments = tempAttachmentRepo
                                    .Where(s => s.EntityId == res.Id)
                                    .Select(s => new AttachmentViewModel
                                    {
                                        Address = s.Address,
                                        Id = s.Id,
                                        Name = s.Name!
                                    }).ToList();
            }

            #endregion

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                var gamificationData = new CalculateScoreViewModel()
                {
                    GroupName = GroupNameGamificationEnum.Documentation,
                    ActionName = ActionNameGamificationEnum.Search,
                    SearchText = searchText
                };
                var scores = await _gamificationService.CalculateScores(gamificationData);
            }
            return new OperationResult<List<UnitDocumentationViewModel>>(true, result, "Documentation are here", new List<ModelError>(), paging);
        }

        public async Task<OperationResult<UnitDocumentationViewModel>> AcceptDocumentation(AcceptDocumentationViewModel model)
        {
            var documentation = _unitDocumentationRepository.GetAllEntityAsNoTracking()
                .Include(s => s.User)
                .FirstOrDefault(s => s.Id == model.DocumentationId);

            if (documentation == null)
                return new OperationResult<UnitDocumentationViewModel>(false, null, "مستند واحدی یافت نشد");

            if (documentation.IsDeleted || documentation.IsActive)
                return new OperationResult<UnitDocumentationViewModel>(false, null, "Question not found");

            var user = documentation.User;
            if (!string.IsNullOrWhiteSpace(model.Text))
            {
                documentation.Text = model.Text;
            }

            if (!string.IsNullOrWhiteSpace(model.Title))
            {
                documentation.Title = model.Title;
            }


            documentation.IsActive = true;
            documentation.User = null;

            await _unitDocumentationRepository.UpdateAsync(documentation, true);

            var notificationStatus = _notificationSender.SendNotification(new SendNotificationDto()
            {
                Entity = documentation,
                NotificationType = NotificationTypeEnum.AcceptDocumentation,
                User = documentation.User,

            });
            var gamificationData = new CalculateScoreViewModel()
            {
                GroupName = GroupNameGamificationEnum.Documentation,
                ActionName = ActionNameGamificationEnum.Confirm,
                Entity = documentation
            };
            var scores = await _gamificationService.CalculateScores(gamificationData);
            var result = _mapper.Map<UnitDocumentationViewModel>(documentation);
            return new OperationResult<UnitDocumentationViewModel>(true, result, "با موفقیت ویرایش شد");
        }

        public async Task<OperationResult<List<PositionViewModel>>> GetAllPositions()
        {
            var positions = await _positionRepository
                .GetEntityAsNoTracking().Include(p => p.Unit).ToListAsync();

            var positionViewModels = positions.Select(p => new PositionViewModel
            {
                PositionId = p.Id,
                PositionName = p.PositionName,
                Unit = new UnitViewModel
                {
                    ID = p.Unit.Id,
                    UnitName = p.Unit.UnitName,
                }
            }).ToList();

            var result = _mapper.Map<List<PositionViewModel>>(positionViewModels);

            return new OperationResult<List<PositionViewModel>>(true, result, "لیست سمت های ثبت شده");
        }

        public async Task<OperationResult<List<PositionViewModel>>> GetCurrentUserPositionsForDepartment()
        {
            var userId = _accountService.GetUserId();
            var unitId = await _unitService.GetIgtUnitIdByUserId(userId);
            if (unitId == -1)
            {
                return new OperationResult<List<PositionViewModel>>(false, null, "اشکال در دریافت دپارتمان شما");
            }
            var positions = await _positionRepository
                .GetEntityAsNoTracking()
                .Where(p => p.UnitId == unitId)
                .Include(p => p.Unit)
                .ToListAsync();
            var positionViewModels = positions.Select(p => new PositionViewModel
            {
                PositionId = p.Id,
                PositionName = p.PositionName,
                Unit = new UnitViewModel
                {
                    ID = p.Unit.Id,
                    UnitName = p.Unit.UnitName,
                }
            }).ToList();

            var result = _mapper.Map<List<PositionViewModel>>(positionViewModels);

            return new OperationResult<List<PositionViewModel>>(true, result, "لیست سمت های قابل انتخاب برای کاربر");

        }

        public async Task<OperationResult<PositionViewModel>> AddPosition(CreatePositionViewModel model)
        {

            var existingPosition = await _positionRepository.GetEntityAsNoTracking()
                .FirstOrDefaultAsync(p => p.PositionName == model.PositionName && p.UnitId == model.UnitId);
            if (existingPosition != null)
            {
                return new OperationResult<PositionViewModel>(false, null, "سمتی با این نام قبلا ثبت شده است.");
            }


            var newPosition = new Position
            {
                PositionName = model.PositionName,
                UnitId = model.UnitId
            };

            await _positionRepository.AddAsync(newPosition, true);


            var unit = await _unitRepository.GetEntityAsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == model.UnitId);
            if (unit == null)
            {
                return new OperationResult<PositionViewModel>(false, null, "واحد مورد نظر یافت نشد.");
            }


            var positionViewModel = new PositionViewModel
            {
                PositionId = newPosition.Id,
                PositionName = model.PositionName,
                Unit = new UnitViewModel
                {
                    ID = unit.Id,
                    UnitName = unit.UnitName
                }
            };

            return new OperationResult<PositionViewModel>(true, positionViewModel, "سمت مودر نظر با موفقیت ثبت شد");
        }

        public async Task<OperationResult<List<SubstituteViewModel>>> AddSubstituteForUnit(CreateSubstituteViewModel model)
        {
            var currentUserId = _accountService.GetUserId();
            var currentUnitId = await _unitService.GetIgtUnitIdByUserId(currentUserId);

            if (currentUnitId == -1)
            {
                return new OperationResult<List<SubstituteViewModel>>(false, null, "اشکال در دریافت دپارتمان شما");
            }

            var currentUnit = await _unitRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(u => u.IgtDepartmentId == currentUnitId);

            if (currentUnit == null)
            {
                try
                {
                    await _unitService.InsertNewUnit(currentUserId);
                }
                catch (Exception)
                {
                    return new OperationResult<List<SubstituteViewModel>>(false, null, "خطا در ایجاد واحد.");
                }
            }



            // var isManager = false;
            // isManager = currentUserId == 1208;
            var isManager = await _unitService.CheckIsManager(currentUserId);
            if (!isManager)
            {
                return new OperationResult<List<SubstituteViewModel>>(false, null, "امکان تعیین جانشین برای مدیران امکان پذیر است.");
            }

            var substitutes = new List<SubstituteViewModel>();

            foreach (var userId in model.UserIds)
            {
                var substituteDepartmentId = await _unitService.GetIgtUnitIdByUserId(userId);
                if (substituteDepartmentId == -1)
                {
                    return new OperationResult<List<SubstituteViewModel>>(false, null, "اشکال در دریافت دپارتمان جانشین");
                }

                if (currentUnitId != substituteDepartmentId)
                {
                    return new OperationResult<List<SubstituteViewModel>>(false, null, $"کاربر با شناسه {userId} در این دپارتمان نیست");
                }

                var existingSubstitute = await _unitSubstituteRepository.GetEntityAsNoTracking()
                    .FirstOrDefaultAsync(p => p.UnitId == substituteDepartmentId && p.UserId == userId);
                if (existingSubstitute != null)
                {
                    return new OperationResult<List<SubstituteViewModel>>(false, null, $"کاربر با شناسه {userId} قبلا ثبت شده است.");
                }

                var newSubstitute = new UnitSubstitute
                {
                    UserId = userId,
                    UnitId = substituteDepartmentId
                };
                await _unitSubstituteRepository.AddAsync(newSubstitute, true);

                var user = await _userRepository.GetEntityAsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == userId);
                var unit = await _unitRepository.GetEntityAsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == substituteDepartmentId);

                if (unit == null)
                {
                    return new OperationResult<List<SubstituteViewModel>>(false, null, "واحد مورد نظر یافت نشد.");
                }

                var substituteViewModel = new SubstituteViewModel
                {
                    User = new UserViewModel
                    {
                        Id = user.Id,
                        FullName = user.FullName
                    },
                    Unit = new UnitViewModel
                    {
                        ID = unit.Id,
                        UnitName = unit.UnitName
                    }
                };

                substitutes.Add(substituteViewModel);
            }

            return new OperationResult<List<SubstituteViewModel>>(true, substitutes, "جانشینان مورد نظر با موفقیت ثبت شدند");
        }
        public async Task<OperationResult<List<SubstituteViewModel>>> GetSubstitutesDepartment()
        {
            var userId = _accountService.GetUserId();
            var unitId = await _unitService.GetIgtUnitIdByUserId(userId);

            var checkIsManager = await _unitService.CheckIsManager(userId);
            // بررسی اینکه کاربر برای این واحد جانشین است
            var isSubstitute = await _unitSubstituteRepository
                .GetEntityAsNoTracking()
                .AnyAsync(p => p.UserId == userId && p.UnitId == unitId);

            if (!checkIsManager && !isSubstitute)
            {
                return new OperationResult<List<SubstituteViewModel>>(false, null, "شما مجاز به مشاهده لیست جانشینان این واحد نیستید");
            }


            var substitute = await _unitSubstituteRepository
                .GetEntityAsNoTracking()
                .Where(p => p.UnitId == unitId)
                .Include(p => p.Unit)
                .Include(p => p.User)
                .ToListAsync();
            var substituteViewModels = substitute.Select(p => new SubstituteViewModel
            {
                Id = p.Id,
                User = new UserViewModel
                {
                    Id = p.User.Id,
                    FullName = p.User.FullName
                },
                Unit = new UnitViewModel
                {
                    ID = p.Unit.Id,
                    UnitName = p.Unit.UnitName,
                }
            }).ToList();

            var result = _mapper.Map<List<SubstituteViewModel>>(substituteViewModels);

            return new OperationResult<List<SubstituteViewModel>>(true, result, "لیست جانشین های این واحد");
        }

        public async Task<OperationResult<PositionViewModel>> DeletePosition(int positionId)
        {
            var position = _positionRepository.GetById(positionId);
            if (position == null)
                return new OperationResult<PositionViewModel>(false, null!, "رکوردی یافت نشد");
            await _positionRepository.DeleteAsync(position, false, true);
            var result = _mapper.Map<PositionViewModel>(position);

            return new OperationResult<PositionViewModel>(true, result, $" .حذف با موفقیت انجام شد");
        }

        public async Task<OperationResult<SubstituteViewModel>> DeleteSubstitute(int substituteId)
        {
            var substitute = _unitSubstituteRepository.GetById(substituteId);

            var userId = _accountService.GetUserId();

            if (substitute == null)
                return new OperationResult<SubstituteViewModel>(false, null!, "رکوردی یافت نشد");

            var currentUnitId = await _unitService.GetIgtUnitIdByUserId(userId);
            var unitId = substitute.UnitId;
            if (currentUnitId != unitId)
            {
                return new OperationResult<SubstituteViewModel>(false, null!, "عدم دسترسی جهت حذف این رکورد");

            }
            await _unitSubstituteRepository.DeleteAsync(substitute, false, true);
            var result = _mapper.Map<SubstituteViewModel>(substitute);

            return new OperationResult<SubstituteViewModel>(true, result, $" .حذف با موفقیت انجام شد");

        }


    }


}
