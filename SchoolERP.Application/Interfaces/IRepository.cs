using SchoolERP.Domain.Common;

namespace SchoolERP.Application.Interfaces;

public interface IGenericRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    IQueryable<T> GetQueryable();
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}

public interface IGlobalRepository<T> where T : GlobalBaseEntity
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    IQueryable<T> GetQueryable();
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<T> Repository<T>() where T : BaseEntity;
    IGlobalRepository<T> GlobalRepository<T>() where T : GlobalBaseEntity;
    Task<int> CompleteAsync();
}
