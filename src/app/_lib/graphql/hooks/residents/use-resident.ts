"use client";

import { useQuery } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import {
  GET_RESIDENT,
  type GetResidentResponse,
} from "../../queries/residents";
import { queryKeys } from "../../query-keys";

export function useResident(id: string) {
  return useQuery({
    queryKey: [...queryKeys.residentsRoot, "detail", id],
    queryFn: () => graphqlRequest<GetResidentResponse>(GET_RESIDENT, { id }),
    select: (data) => data.resident,
    enabled: Boolean(id),
  });
}
