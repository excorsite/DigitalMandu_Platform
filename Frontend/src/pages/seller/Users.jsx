import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import client from "../../api/client";

export default function SellerUsers() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["seller-users"],
    queryFn: () => client.get("/users").then((response) => response.data),
  });
  const deleteUser = useMutation({
    mutationFn: (userId) => client.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-users"] });
      toast.success("User deleted");
    },
    onError: (deleteError) =>
      toast.error(
        deleteError.response?.data?.message || "Could not delete user",
      ),
  });

  const users = data?.userData ?? data?.data ?? [];

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Loading registered users...
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            SELLER MANAGEMENT
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Registered users</h1>
          <p className="mt-1 text-sm text-gray-600">
            View customer accounts and remove accounts that should no longer
            have access.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {isError ? (
        <div className="border-y border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <p>
            {error.response?.data?.message ||
              "Could not load registered users."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="border-y border-gray-200 px-5 py-12 text-center">
          <h2 className="font-semibold text-gray-900">
            No registered users yet
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Customer accounts will appear here when they register.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-y border-gray-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Phone
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Registered
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900">
                    {user.name || "-"}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {user.email || "-"}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {user.phone || "-"}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(`Delete ${user.name || user.email}?`)
                        ) {
                          deleteUser.mutate(user._id);
                        }
                      }}
                      disabled={deleteUser.isPending}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
