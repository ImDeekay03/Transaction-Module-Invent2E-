﻿
namespace Transaction_Module__Invent2E_.Services.Interfaces
{
    public interface IOrderService
    {
        Task<string?> GetAllOrdersAsync();
    }
}
