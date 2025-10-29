import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/adminApi';
import { NIGERIAN_UNIVERSITIES, FACULTIES, LEVELS, DEPARTMENTS } from '../../utils/constants';
import { toast } from 'react-hot-toast';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await adminApi.users.getAllUsers();
    if (result.success) {
      setUsers(result.data.users);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole, assignments = {}) => {
    const result = await adminApi.users.updateUserRole(userId, { role: newRole, ...assignments });
    if (result.success) {
      toast.success('User role updated successfully!');
      loadUsers();
      setShowRoleModal(false);
      setSelectedUser(null);
    } else {
      toast.error(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-[13px]">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h1 className="text-base font-semibold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-600">View and manage user roles and permissions</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Users ({users.length})</h2>
        </div>

        {users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No users found.</div>
        ) : (
          <div className="w-full">
            {/* Header Row */}
            <div className="grid grid-cols-6 gap-4 px-5 py-2 bg-white text-[12px] font-semibold tracking-wide text-gray-500 uppercase">
              <div>No.</div>
              <div>Name</div>
              <div>Username</div>
              <div>Email</div>
              <div>Role</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100">
              {users.map((user, index) => (
                <div key={user._id} className="px-5 py-3">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div className="text-gray-500">{index + 1}</div>
                    <div className="truncate text-gray-900">{user.name || '-'}</div>
                    <div className="truncate text-gray-700">{user.username || '-'}</div>
                    <div className="truncate text-gray-700">{user.email || '-'}</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'subadmin' ? 'bg-blue-100 text-blue-800' :
                        user.role?.includes('admin') ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role?.replace('_', ' ').toUpperCase() || 'USER'}
                      </span>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className="inline-flex items-center bg-blue-600 text-white px-3 py-1.5 rounded text-[12px] hover:bg-blue-700"
                      >
                        Change Role
                      </button>
                    </div>
                  </div>

                  {(user.role === 'subadmin' || user.role?.includes('admin')) && (
                    <div className="mt-2 text-xs text-gray-500">
                      {user.assignedUniversities?.length > 0 && (
                        <span>Universities: {user.assignedUniversities.join(', ')}</span>
                      )}
                      {user.assignedFaculties?.length > 0 && (
                        <span> {user.assignedUniversities?.length ? '|' : ''} Faculties: {user.assignedFaculties.join(', ')}</span>
                      )}
                      {user.assignedDepartments?.length > 0 && (
                        <span> {(user.assignedUniversities?.length || user.assignedFaculties?.length) ? '|' : ''} Departments: {user.assignedDepartments.join(', ')}</span>
                      )}
                      {user.assignedLevels?.length > 0 && (
                        <span> {(user.assignedUniversities?.length || user.assignedFaculties?.length || user.assignedDepartments?.length) ? '|' : ''} Levels: {user.assignedLevels.join(', ')}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <RoleChangeModal
          user={selectedUser}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleRoleChange}
        />
      )}
    </div>
  );
};

// Role Change Modal Component
const RoleChangeModal = ({ user, onClose, onSubmit }) => {
  const [role, setRole] = useState(user.role || 'user');
  const [assignments, setAssignments] = useState({
    assignedUniversities: user.assignedUniversities || [],
    assignedFaculties: user.assignedFaculties || [],
    assignedLevels: user.assignedLevels || [],
    assignedDepartments: user.assignedDepartments || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(user._id, role, role === 'subadmin' ? assignments : {});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Change User Role</h3>
          <p className="text-sm text-gray-600">Update role for {user.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin (Full Access)</option>
              <option value="subadmin">Sub-Admin (Scoped)</option>
              <option value="waec_admin">WAEC Admin</option>
              <option value="jamb_admin">JAMB Admin</option>
            </select>
          </div>

          {role === 'subadmin' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned University</label>
                <select
                  value={assignments.assignedUniversities[0] || ''}
                  onChange={(e) => setAssignments({
                    ...assignments,
                    assignedUniversities: e.target.value ? [e.target.value] : []
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select university</option>
                  {NIGERIAN_UNIVERSITIES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Faculty</label>
                <select
                  value={assignments.assignedFaculties[0] || ''}
                  onChange={(e) => setAssignments({
                    ...assignments,
                    assignedFaculties: e.target.value ? [e.target.value] : [],
                    assignedDepartments: [] // Clear departments when faculty changes
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select faculty</option>
                  {FACULTIES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Department</label>
                <select
                  value={assignments.assignedDepartments[0] || ''}
                  onChange={(e) => setAssignments({
                    ...assignments,
                    assignedDepartments: e.target.value ? [e.target.value] : []
                  })}
                  disabled={!assignments.assignedFaculties[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {assignments.assignedFaculties[0] ? 'Select department' : 'Select faculty first'}
                  </option>
                  {assignments.assignedFaculties[0] && DEPARTMENTS[assignments.assignedFaculties[0]]?.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Level</label>
                <select
                  value={assignments.assignedLevels[0] || ''}
                  onChange={(e) => setAssignments({
                    ...assignments,
                    assignedLevels: e.target.value ? [e.target.value] : []
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select level</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Update Role
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsersManagement;
