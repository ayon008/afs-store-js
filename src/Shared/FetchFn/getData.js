'use client'
import { useQuery } from '@tanstack/react-query'

export default function GetData(key, fn, params = "") {
    const { isLoading, isError, error, data, refetch } = useQuery({
        queryKey: [key],
        queryFn: async () => {
            const data = await fn(params);
            return data;
        },
    })
    return { isLoading, isError, error, data, refetch }
}



