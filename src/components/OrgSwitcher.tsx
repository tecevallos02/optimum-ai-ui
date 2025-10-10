// path: src/components/OrgSwitcher.tsx
"use client";

import { useState, useRef, useEffect } from "react";

type Org = { id: string; name: string; role?: string; logo?: string };

export default function OrgSwitcher({
  orgs,
  currentOrgId,
  onChange,
  disabled,
}: {
  orgs: Org[];
  currentOrgId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOrg = orgs.find(org => org.id === currentOrgId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOrgSelect = (orgId: string) => {
    onChange(orgId);
    setIsOpen(false);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'MANAGER':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'AGENT':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'OWNER':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.734.99A.996.996 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 11-.992 1.736l-1.75-1A.996.996 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a.996.996 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.277V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
          </svg>
        );
      case 'MANAGER':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        );
      case 'AGENT':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (!currentOrg) {
    return (
      <div className="text-sm text-gray-500">No organization selected</div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {/* Modern Organization Card */}
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-accent/10 transition-all duration-300 group min-w-[200px]">
          {/* Organization Logo/Icon */}
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
            {currentOrg.logo ? (
              <img 
                src={currentOrg.logo} 
                alt={`${currentOrg.name} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to role icon if logo fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.className = `w-8 h-8 rounded-lg ${getRoleColor(currentOrg.role)} flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all duration-300`;
                    parent.innerHTML = getRoleIcon(currentOrg.role)?.props.children || '';
                  }
                }}
              />
            ) : (
              <div className={`w-full h-full ${getRoleColor(currentOrg.role)} flex items-center justify-center text-white`}>
                {getRoleIcon(currentOrg.role)}
              </div>
            )}
          </div>
          
          {/* Organization Info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors duration-300">
              {currentOrg.name}
            </div>
            {currentOrg.role && (
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {currentOrg.role}
              </div>
            )}
          </div>
          
          {/* Dropdown Arrow */}
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full z-50">
          <div className="bg-background dark:bg-gray-800 rounded-xl shadow-2xl border border-border dark:border-gray-700 overflow-hidden backdrop-blur-sm">
            <div className="p-2">
              {orgs.map((org) => (
                <div
                  key={org.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-accent/10 ${
                    org.id === currentOrgId ? 'bg-accent/20 border-l-2 border-accent' : ''
                  }`}
                  onClick={() => handleOrgSelect(org.id)}
                >
                  {/* Organization Logo/Icon */}
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                    {org.logo ? (
                      <img 
                        src={org.logo} 
                        alt={`${org.name} logo`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to role icon if logo fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.className = `w-8 h-8 rounded-lg ${getRoleColor(org.role)} flex items-center justify-center text-white text-sm shadow-sm`;
                            parent.innerHTML = getRoleIcon(org.role)?.props.children || '';
                          }
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full ${getRoleColor(org.role)} flex items-center justify-center text-white text-sm`}>
                        {getRoleIcon(org.role)}
                      </div>
                    )}
                  </div>
                  
                  {/* Organization Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {org.name}
                    </div>
                    {org.role && (
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {org.role}
                      </div>
                    )}
                  </div>
                  
                  {/* Selection Indicator */}
                  {org.id === currentOrgId && (
                    <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
