import { useAsync } from 'react-use'
import { bookApi } from '../api/BookApi'

export function HomeView() {
  const state = useAsync(() => bookApi.getMetadata())
  return (
    <>
      {state.value && (
        <div>
          <h2>{state.value.title}</h2>
          <p>{state.value.description}</p>
          <img src={state.value.cover} />
        </div>
      )}
    </>
  )
}
