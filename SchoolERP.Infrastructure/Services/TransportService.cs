using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Transport;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;

namespace SchoolERP.Infrastructure.Services;

public class TransportService : ITransportService
{
    private readonly ApplicationDbContext _context;

    public TransportService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Vehicles
    public async Task<IEnumerable<TransportVehicleDto>> GetAllVehiclesAsync()
    {
        return await _context.TransportVehicles
            .Select(v => new TransportVehicleDto
            {
                Id = v.Id,
                VehicleNo = v.VehicleNo,
                VehicleModel = v.VehicleModel,
                FuelType = v.FuelType,
                Capacity = v.Capacity,
                RegistrationDetails = v.RegistrationDetails,
                ChasisNo = v.ChasisNo,
                DriverName = v.DriverName,
                DriverPhone = v.DriverPhone,
                IsActive = v.IsActive
            }).ToListAsync();
    }

    public async Task<TransportVehicleDto> GetVehicleByIdAsync(Guid id)
    {
        var v = await _context.TransportVehicles.FindAsync(id);
        if (v == null) return null!;
        
        return new TransportVehicleDto
        {
            Id = v.Id,
            VehicleNo = v.VehicleNo,
            VehicleModel = v.VehicleModel,
            FuelType = v.FuelType,
            Capacity = v.Capacity,
            RegistrationDetails = v.RegistrationDetails,
            ChasisNo = v.ChasisNo,
            DriverName = v.DriverName,
            DriverPhone = v.DriverPhone,
            IsActive = v.IsActive
        };
    }

    public async Task<TransportVehicleDto> CreateVehicleAsync(CreateTransportVehicleDto dto)
    {
        var vehicle = new TransportVehicle
        {
            VehicleNo = dto.VehicleNo,
            VehicleModel = dto.VehicleModel,
            FuelType = dto.FuelType,
            Capacity = dto.Capacity,
            RegistrationDetails = dto.RegistrationDetails,
            ChasisNo = dto.ChasisNo,
            DriverName = dto.DriverName,
            DriverPhone = dto.DriverPhone
        };

        _context.TransportVehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        return await GetVehicleByIdAsync(vehicle.Id);
    }

    public async Task<TransportVehicleDto> UpdateVehicleAsync(Guid id, CreateTransportVehicleDto dto)
    {
        var vehicle = await _context.TransportVehicles.FindAsync(id);
        if (vehicle == null) return null!;

        vehicle.VehicleNo = dto.VehicleNo;
        vehicle.VehicleModel = dto.VehicleModel;
        vehicle.FuelType = dto.FuelType;
        vehicle.Capacity = dto.Capacity;
        vehicle.RegistrationDetails = dto.RegistrationDetails;
        vehicle.ChasisNo = dto.ChasisNo;
        vehicle.DriverName = dto.DriverName;
        vehicle.DriverPhone = dto.DriverPhone;

        await _context.SaveChangesAsync();
        return await GetVehicleByIdAsync(id);
    }

    public async Task<bool> DeleteVehicleAsync(Guid id)
    {
        var vehicle = await _context.TransportVehicles.FindAsync(id);
        if (vehicle == null) return false;

        _context.TransportVehicles.Remove(vehicle);
        await _context.SaveChangesAsync();
        return true;
    }

    // Routes
    public async Task<IEnumerable<TransportRouteDto>> GetAllRoutesAsync()
    {
        return await _context.TransportRoutes
            .Include(r => r.Vehicle)
            .Select(r => new TransportRouteDto
            {
                Id = r.Id,
                RouteName = r.RouteName,
                VehicleId = r.VehicleId,
                VehicleNo = r.Vehicle != null ? r.Vehicle.VehicleNo : null,
                DriverName = r.DriverName,
                RouteCost = r.RouteCost,
                IsActive = r.IsActive,
                UserCount = _context.TransportAssignments.Count(a => a.RouteId == r.Id && a.IsActive)
            }).ToListAsync();
    }

    public async Task<TransportRouteDto> GetRouteByIdAsync(Guid id)
    {
        var r = await _context.TransportRoutes
            .Include(x => x.Vehicle)
            .FirstOrDefaultAsync(x => x.Id == id);
            
        if (r == null) return null!;

        return new TransportRouteDto
        {
            Id = r.Id,
            RouteName = r.RouteName,
            VehicleId = r.VehicleId,
            VehicleNo = r.Vehicle != null ? r.Vehicle.VehicleNo : null,
            DriverName = r.DriverName,
            RouteCost = r.RouteCost,
            IsActive = r.IsActive,
            UserCount = _context.TransportAssignments.Count(a => a.RouteId == r.Id && a.IsActive)
        };
    }

    public async Task<TransportRouteDto> CreateRouteAsync(CreateTransportRouteDto dto)
    {
        var route = new TransportRoute
        {
            RouteName = dto.RouteName,
            VehicleId = dto.VehicleId,
            DriverName = dto.DriverName,
            RouteCost = dto.RouteCost
        };

        _context.TransportRoutes.Add(route);
        await _context.SaveChangesAsync();

        return await GetRouteByIdAsync(route.Id);
    }

    public async Task<TransportRouteDto> UpdateRouteAsync(Guid id, CreateTransportRouteDto dto)
    {
        var route = await _context.TransportRoutes.FindAsync(id);
        if (route == null) return null!;

        route.RouteName = dto.RouteName;
        route.VehicleId = dto.VehicleId;
        route.DriverName = dto.DriverName;
        route.RouteCost = dto.RouteCost;

        await _context.SaveChangesAsync();
        return await GetRouteByIdAsync(id);
    }

    public async Task<bool> DeleteRouteAsync(Guid id)
    {
        var route = await _context.TransportRoutes.FindAsync(id);
        if (route == null) return false;

        _context.TransportRoutes.Remove(route);
        await _context.SaveChangesAsync();
        return true;
    }

    // Assignments
    public async Task<IEnumerable<TransportAssignmentDto>> GetAllAssignmentsAsync()
    {
        return await _context.TransportAssignments
            .Where(a => a.IsActive)
            .OrderByDescending(a => a.CreatedAt)
            .Include(a => a.Student)
                .ThenInclude(s => s.AcademicRecords)
                    .ThenInclude(ar => ar.Class)
            .Include(a => a.Employee)
            .Include(a => a.Route)
                .ThenInclude(r => r.Vehicle)
            .Include(a => a.Stoppage)
            .Select(a => new TransportAssignmentDto
            {
                Id = a.Id,
                StudentId = a.StudentId,
                StudentName = a.Student.FirstName + " " + a.Student.LastName,
                AdmissionNo = a.Student.AdmissionNo,
                ClassName = a.Student.AcademicRecords.Where(ar => ar.IsCurrent).Select(ar => ar.Class.Name).FirstOrDefault(),
                EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee != null ? a.Employee.FirstName + " " + a.Employee.LastName : null,
                RouteId = a.RouteId,
                RouteName = a.Route.RouteName,
                VehicleNo = a.Route.Vehicle != null ? a.Route.Vehicle.VehicleNo : null,
                StoppageId = a.StoppageId,
                StoppageName = a.Stoppage != null ? a.Stoppage.Name : null,
                AppliedCost = a.AppliedCost,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                IsActive = a.IsActive
            }).ToListAsync();
    }


    public async Task<TransportAssignmentDto> AssignTransportAsync(CreateTransportAssignmentDto dto)
    {
        // 1. Duplicate check (prevent assigning same student to multiple active transport records)
        // If it's a student assignment
        if (dto.StudentId != Guid.Empty)
        {
             var conflict = await _context.TransportAssignments
                .AnyAsync(a => a.StudentId == dto.StudentId && a.IsActive && a.RouteId == dto.RouteId && (!dto.StoppageId.HasValue || a.StoppageId == dto.StoppageId));
                
             if (conflict) throw new Exception("This student is already assigned to this transport route/stoppage.");
        }

        // Deactivate existing assignment for this student if any
        var existing = await _context.TransportAssignments
            .Where(a => a.StudentId == dto.StudentId && a.IsActive)
            .ToListAsync();
            
        foreach (var a in existing) a.IsActive = false;

        // 2. Determine Cost (if not provided, use stoppage cost, else route cost)
        decimal appliedCost = dto.AppliedCost ?? 0;
        if (appliedCost == 0)
        {
            if (dto.StoppageId.HasValue)
            {
                var stop = await _context.TransportStoppages.FindAsync(dto.StoppageId.Value);
                if (stop != null) appliedCost = stop.Cost;
            }
            else
            {
                var route = await _context.TransportRoutes.FindAsync(dto.RouteId);
                if (route != null) appliedCost = route.RouteCost;
            }
        }

        var assignment = new TransportAssignment
        {
            StudentId = dto.StudentId,
            EmployeeId = dto.EmployeeId,
            RouteId = dto.RouteId,
            StoppageId = dto.StoppageId,
            AppliedCost = appliedCost,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = true
        };

        _context.TransportAssignments.Add(assignment);
        
        // --- LINK WITH FINANCE & STUDENT PROFILE ---
        if (dto.StudentId != Guid.Empty)
        {
            var student = await _context.Students.FindAsync(dto.StudentId);
            var route = await _context.TransportRoutes.Include(r => r.Vehicle).FirstOrDefaultAsync(r => r.Id == dto.RouteId);
            var stoppage = dto.StoppageId.HasValue ? await _context.TransportStoppages.FindAsync(dto.StoppageId.Value) : null;

            if (student != null)
            {
                student.Bus = route?.Vehicle?.VehicleNo;
                student.RouteName = route?.RouteName;
                student.StoppageName = stoppage?.Name;
                student.BusFee = appliedCost;
            }

            var head = await _context.FeeHeads.FirstOrDefaultAsync(h => h.Name == "Transport Fee" || h.Name == "Bus Fee");
            if (head != null)
            {
                var subscription = await _context.StudentFeeSubscriptions
                    .FirstOrDefaultAsync(s => s.StudentId == dto.StudentId && s.FeeHeadId == head.Id);
                
                if (subscription == null)
                {
                    subscription = new StudentFeeSubscription
                    {
                        StudentId = dto.StudentId,
                        FeeHeadId = head.Id,
                        CustomAmount = appliedCost,
                        IsActive = true
                    };
                    _context.StudentFeeSubscriptions.Add(subscription);
                }
                else
                {
                    subscription.CustomAmount = appliedCost;
                    subscription.IsActive = true;
                }
            }
        }
        // -------------------------

        await _context.SaveChangesAsync();

        return (await GetAllAssignmentsAsync()).First(x => x.Id == assignment.Id);
    }

    public async Task<bool> RemoveAssignmentAsync(Guid id)
    {
        var assignment = await _context.TransportAssignments.FindAsync(id);
        if (assignment == null) return false;

        assignment.IsActive = false;
        assignment.EndDate = DateTime.UtcNow;

        // --- LINK WITH FINANCE & STUDENT PROFILE (Clear fields) ---
        if (assignment.StudentId != Guid.Empty)
        {
            var student = await _context.Students.FindAsync(assignment.StudentId);
            if (student != null)
            {
                student.Bus = null;
                student.RouteName = null;
                student.StoppageName = null;
                student.BusFee = null;
            }

            var head = await _context.FeeHeads.FirstOrDefaultAsync(h => h.Name == "Transport Fee" || h.Name == "Bus Fee");
            if (head != null)
            {
                var subscription = await _context.StudentFeeSubscriptions
                    .FirstOrDefaultAsync(s => s.StudentId == assignment.StudentId && s.FeeHeadId == head.Id);
                if (subscription != null) subscription.IsActive = false;
            }
        }
        // ----------------------------------------------------

        await _context.SaveChangesAsync();
        return true;
    }

    // Stoppages
    public async Task<IEnumerable<TransportStoppageDto>> GetAllStoppagesAsync()
    {
        return await _context.TransportStoppages
            .Select(s => new TransportStoppageDto
            {
                Id = s.Id,
                Name = s.Name,
                Cost = s.Cost,
                IsActive = s.IsActive
            }).ToListAsync();
    }

    public async Task<TransportStoppageDto> GetStoppageByIdAsync(Guid id)
    {
        var s = await _context.TransportStoppages.FindAsync(id);
        if (s == null) return null!;

        return new TransportStoppageDto
        {
            Id = s.Id,
            Name = s.Name,
            Cost = s.Cost,
            IsActive = s.IsActive
        };
    }

    public async Task<TransportStoppageDto> CreateStoppageAsync(CreateTransportStoppageDto dto)
    {
        var stoppage = new TransportStoppage
        {
            Name = dto.Name,
            Cost = dto.Cost,
            IsActive = true
        };

        _context.TransportStoppages.Add(stoppage);
        await _context.SaveChangesAsync();

        return MapToStoppageDto(stoppage);
    }

    public async Task<TransportStoppageDto> UpdateStoppageAsync(Guid id, CreateTransportStoppageDto dto)
    {
        var stoppage = await _context.TransportStoppages.FindAsync(id);
        if (stoppage == null) return null!;

        stoppage.Name = dto.Name;
        stoppage.Cost = dto.Cost;

        await _context.SaveChangesAsync();
        return MapToStoppageDto(stoppage);
    }

    public async Task<bool> DeleteStoppageAsync(Guid id)
    {
        var stoppage = await _context.TransportStoppages.FindAsync(id);
        if (stoppage == null) return false;

        _context.TransportStoppages.Remove(stoppage);
        await _context.SaveChangesAsync();
        return true;
    }

    private TransportStoppageDto MapToStoppageDto(TransportStoppage s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Cost = s.Cost,
        IsActive = s.IsActive
    };
}

