"use client";

import { useQuery } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";

import {
  GET_HOUSEHOLDS,
  type GetHouseholdsResponse,
} from "../../queries/households";
import { queryKeys } from "../../query-keys";

export function useHouseholds() {
  return useQuery({
    queryKey: queryKeys.households,

    queryFn: () => graphqlRequest<GetHouseholdsResponse>(GET_HOUSEHOLDS),

    select: (data) => data.households,
  });
}
