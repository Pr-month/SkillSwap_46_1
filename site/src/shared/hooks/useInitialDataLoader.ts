import { useEffect } from "react";
import { useDispatch, useSelector } from "../../services/store";
import { fetchSkills } from "../../services/skill/actions";
import {
  fetchCategories,
  fetchSubCategories,
} from "../../services/category/actions";
import { fetchMyRequests } from "../../services/request/actions";

export const useInitialDataLoader = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const sentRequests = useSelector((state) => state.requests.sent);
  const receivedRequests = useSelector((state) => state.requests.received);

  useEffect(() => {
    dispatch(fetchSkills());
    dispatch(fetchCategories());
    dispatch(fetchSubCategories());

    if (
      currentUser &&
      sentRequests.length === 0 &&
      receivedRequests.length === 0
    ) {
      dispatch(fetchMyRequests());
    }
  }, [dispatch, currentUser, sentRequests.length, receivedRequests.length]);
};
