import React, { useState, useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';
import { call, put, takeEvery } from 'redux-saga/effects';

const SET_NAME = 'SET_NAME';
const SET_TASKS = 'SET_TASKS';
const ADD_TASK = 'ADD_TASK';
const DELETE_TASK = 'DELETE_TASK';
const EDIT_TASK = 'EDIT_TASK';
const FETCH_TASKS = 'FETCH_TASKS';

// actions
const setName = (name) => ({ type: SET_NAME, payload: name });
const setTasks = (tasks) => ({ type: SET_TASKS, payload: tasks });
const addTask = (task) => ({ type: ADD_TASK, payload: task });
const deleteTask = (taskId) => ({ type: DELETE_TASK, payload: taskId });
const editTask = (taskId, title) => ({
  type: EDIT_TASK,
  payload: { taskId, title },
});
const fetchTasks = () => ({ type: FETCH_TASKS });

// reducer
const nameReducer = (state = '', action) => {
  switch (action.type) {
    case SET_NAME:
      return action.payload;
    default:
      return state;
  }
};

const tasksReducer = (state = [], action) => {
  switch (action.type) {
    case SET_TASKS:
      return action.payload;
    case ADD_TASK:
      return [...state, action.payload];
    case DELETE_TASK:
      return state.filter((task) => task.id !== action.payload);
    case EDIT_TASK:
      return state.map((task) =>
        task.id === action.payload.taskId
          ? { ...task, title: action.payload.title }
          : task
      );
    default:
      return state;
  }
};

// Saga fetch data
function* fetchTasksSaga() {
  try {
    const response = yield call(
      axios.get,
      'https://64a67e6a096b3f0fcc7fe3e0.mockapi.io/tasks'
    );
    yield put(setTasks(response.data));
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

// Saga delete
function* deleteTaskSagaWorker(action) {
  try {
    yield call(
      axios.delete,
      `https://64a67e6a096b3f0fcc7fe3e0.mockapi.io/tasks/${action.payload}`
    );
    yield put(deleteTask(action.payload));
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}
// Saga add
function* addTaskSaga(action) {
  try {
    const response = yield call(
      axios.post,
      'https://64a67e6a096b3f0fcc7fe3e0.mockapi.io/tasks',
      { title: action.payload }
    );
    yield put({ type: ADD_TASK_SUCCESS, payload: response.data });
  } catch (error) {
    console.error('Error adding task:', error);
  }
}
// edit saga
function* editTaskSaga(action) {
  try {
    const response = yield call(
      axios.put,
      `https://64a67e6a096b3f0fcc7fe3e0.mockapi.io/tasks/${action.payload.taskId}`,
      { title: action.payload.title }
    );
    yield put({ type: EDIT_TASK_SUCCESS, payload: response.data });
  } catch (error) {
    console.error('Error editing task:', error);
  }
}

function* rootSaga() {
  yield takeEvery(FETCH_TASKS, fetchTasksSaga);
  yield takeEvery(DELETE_TASK, deleteTaskSagaWorker);
  yield takeEvery(ADD_TASK, addTaskSaga);
  yield takeEvery(EDIT_TASK, editTaskSaga);
}

// Store
const sagaMiddleware = createSagaMiddleware();
const store = configureStore({
  reducer: {
    name: nameReducer,
    tasks: tasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});
sagaMiddleware.run(rootSaga);

// Màn hình chính
function HomeScreen({ navigation }) {
  const name = useSelector((state) => state.name);
  const dispatch = useDispatch();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 100,
      }}>
      <Text
        style={{
          color: '#8353E2',
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: 25,
          textTransform: 'uppercase',
        }}>
        Manage your{'\n'}task
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'gray',
          borderRadius: 10,
          padding: 10,
        }}>
        <Image
          source={require('./assets/email.png')}
          style={{ width: 20, height: 20, marginRight: 10 }}
        />
        <TextInput
          style={{
            flex: 1,
            textAlign: 'center',
            paddingHorizontal: 40,
            outline: 'none',
          }}
          placeholder="Enter your name"
          placeholderTextColor="gray"
          value={name}
          onChangeText={(value) => dispatch(setName(value))}
        />
      </View>
      <TouchableOpacity
        style={{
          padding: 10,
          paddingHorizontal: 40,
          backgroundColor: '#00BDD6',
          borderRadius: 10,
        }}
        onPress={() => navigation.navigate('Details')}>
        <Text style={{ color: 'white', textTransform: 'uppercase' }}>
          Get Started ➙
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function DetailsScreen({ navigation }) {
  const userName = useSelector((state) => state.name);
  const tasks = useSelector((state) => state.tasks);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
        justifyContent: 'center',
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
         
        }}>
        <TouchableOpacity
          style={{
            padding: 10,
          }}
          onPress={() => navigation.goBack()}>
          <Image
            source={require('./assets/back_icon.png')}
            style={{ width: 40, height: 40, marginRight: 10 }}
          />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <View>
            <Image
              source={require('./assets/avatar.png')}
              style={{ width: 50, height: 50, marginRight: 10 }}
            />
          </View>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'gray' }}>
              Hi {userName}
            </Text>
            <Text style={{ fontSize: 14, color: 'gray' }}>
              Have a great day ahead
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 10,
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
          marginBottom: 20,
        }}>
        <Image
          source={require('./assets/search_icon.png')}
          style={{ width: 20, height: 20, marginRight: 10 }}
        />
        <TextInput
          placeholder="Search"
          style={{ flex: 1, fontSize: 16, outline: 'none' }}
        />
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#DEE1E678',
              padding: 10,
              marginVertical: 5,
              borderRadius: 30,
              borderColor: '#9095A0',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 5,
            }}>
            <View>
              <Image
                source={require('./assets/icon_tick.png')}
                style={{ width: 20, height: 20 }}
              />
            </View>
            <TextInput
              style={{
                flex: 1,
                borderBottomColor: '#ccc',
                padding: 5,
                marginRight: 10,
                outline: 'none',
                fontWeight: 'bold',
              }}
              value={item.title}
              editable={false}
            />
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
              }}>
              <TouchableOpacity
                onPress={() => dispatch(deleteTask(item.id))}>
                <Image
                  source={require('./assets/delete.png')}
                  style={{ width: 20, height: 20 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('AddTask', {
                    taskToEdit: item,
                  })
                }>
                <Image
                  source={require('./Frame.png')}
                  style={{ width: 20, height: 20 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#00BDD6',
            borderRadius: 30,
            width: 60,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 5,
            position: 'relative',
          }}
          onPress={() => navigation.navigate('AddTask', { tasktoEdit: null })}>
          <Image
            source={require('./assets/icon-add.png')}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
function AddTaskScreen({ navigation, route }) {
  const { taskToEdit } = route.params;
  const [task, setTask] = useState(taskToEdit ? taskToEdit.title : '');
  const dispatch = useDispatch();
  const userName=useSelector((state)=>state.name)
  const handleFinish = () => {
    const url = taskToEdit
      ? `https://64a67e6a096b3f0fcc7fe3e0.mockapi.io/tasks/${taskToEdit.id}`
      : 'https://64a67e6a096b3f0fcc7fe3e0.mockapi.io/tasks';
    const method = taskToEdit ? axios.put : axios.post;

    method(url, { title: task })
      .then((response) => {
        if (taskToEdit) {
          dispatch(editTask(taskToEdit.id, task));
        } else {
          dispatch(addTask(response.data));
        }
        navigation.goBack();
      })
      .catch((error) => console.error('Error updating or adding task:', error));
  };

  return (
      <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flex: 2,
           gap:100
        }}>
        <TouchableOpacity
          style={{
            padding: 10,
          }}
          onPress={() => navigation.goBack()}>
          <Image
            source={require('./assets/back_icon.png')}
style={{ width: 40, height: 40, marginRight: 10 }}
          />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <View>
            <Image
              source={require('./assets/avatar.png')}
              style={{ width: 40, height: 40, marginRight: 10 }}
            />
          </View>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'gray' }}>
              Hi {userName}
            </Text>
            <Text style={{ fontSize: 14, color: 'gray' }}>
              Have a great day ahead
            </Text>
          </View>
        </View>
      </View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: 'black',
          textTransform: 'uppercase',
        }}>
        Add your Job
      </Text>
      <TextInput
        style={{
          width: '80%',
          textAlign: 'center',
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor:'gray',
          borderRadius: 5,
          padding: 10,
          outline:'none'
        }}
        placeholder="input your task"
        placeholderTextColor="gray"
        value={task}
        onChangeText={(value) => setTask(value)}
      />
      <TouchableOpacity
        style={{
          padding: 10,
          paddingHorizontal: 40,
          backgroundColor: '#00BDD6',
          borderRadius: 10,
        }}
        onPress={ handleFinish}>
        <Text style={{ color: 'white', textTransform: 'uppercase' }}>
          {taskToEdit ? 'EDIT YOUR JOB' : 'ADD YOUR JOB'}
        </Text>
      </TouchableOpacity>
      <View
        style={{
          flex: 4,
          marginTop:50
        }}>
        <Image
          source={require('./assets/NoteImage.png')}
          style={{ width: 200, height: 200, marginRight: 10 }}
        />
      </View>
    </View>
  );
}

const Stack = createNativeStackNavigator();
function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddTask"
            component={AddTaskScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;
