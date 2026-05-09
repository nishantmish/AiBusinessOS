namespace AiBusinessOS.Shared.Common;

public sealed class Result<T>
{
    private Result(bool isSuccess, T? data, string? error)
    {
        IsSuccess = isSuccess;
        Data = data;
        Error = error;
    }

    public bool IsSuccess { get; }
    public T? Data { get; }
    public string? Error { get; }

    public static Result<T> Success(T data) => new(true, data, null);
    public static Result<T> Failure(string error) => new(false, default, error);
}
