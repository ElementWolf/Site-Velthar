"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./UserAuthContext";
import { publicRoutes, routesDictionary } from "@/routesDictionary";

const RouteGuardContext = createContext();

export const useRouteGuard = () => useContext(RouteGuardContext);

export const RouteGuardProvider = ({ children }) => {
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const isPublic = publicRoutes.includes(pathname);
        if (user) router.push(routesDictionary.dashboard)
        else if (!isPublic) router.push(routesDictionary.index)
    }, [user, pathname]);

    return (
        <RouteGuardContext.Provider value={{}}>
            {children}
        </RouteGuardContext.Provider>
    );
};