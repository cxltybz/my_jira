import qs from "qs";
import * as auth from "auth-provider";
import { useAuth } from "context/auth-context";

const apiUrl = process.env.REACT_APP_API_URL;

interface Config extends RequestInit {
  token?: string;
  data?: object;
}

export const http = async (
  endpoint: string,
  { data, token, headers, ...customConfig }: Config = {},
) => {
  const config = {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": data ? "application/json" : "",
    },
    ...customConfig,
  };
  if (config.method.toUpperCase() === "GET") {
    endpoint += `?${qs.stringify(data)}`;
  } else {
    config.body = JSON.stringify(data || {});
  }
  // axios 和 fetch的表现不一样，axios可以直接在返回状态不为2xx的时候抛出异常
  return window
    .fetch(`${apiUrl}/${endpoint}`, config)
    .then(async (response: Response) => {
      if (response.status === 401) {
        await auth.logout();
        window.location.reload();
        return Promise.reject({ message: "请重新登录" });
      }
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        return Promise.reject(data);
      }
    });
};

// JS中的typeof，是在runtime时运行的
// return typeof 1==='number'

// TS中的typeof,是在静态环境运行的
// return (...[endpoint, config]: Parameters<typeof http>) =>

export const useHttp = () => {
  const { user } = useAuth();
  // utility type 的用法: 用泛型给它传入一个其他类型,然后utility type对这个类型进行某种操作
  return (...[endpoint, config]: Parameters<typeof http>) =>
    http(endpoint, { ...config, token: user?.token });
};

// 联合类型
// let myFavoriteNumber: string | number;
// (myFavoriteNumber = "seven"), (myFavoriteNumber = 7);

// let jackFavoriteNumber: string | number;

// 类型别名在很多情况下可以和interface互换
// interface Person {
//   name: string;
// }
// type Person = { name: string };
// const xiaoMing: Person = { name: "xiaoming" };

// 类型别名,interface在这种情况下没法代替type
// type FavoriteNumber = string | number;
// let roseFavoriteNumber: FavoriteNumber = 6;

// interface 也没法实现Utility type
type Person = {
  name: string;
  age: number;
};
// xiaoMing里可以都不存在或者存在某一个属性
// const xiaoMing: Partial<Person> = {};
// shenMiRen后面写上某个属性就代表哪个属性不能存在
// const shenMiRen: Omit<Person, "name" | "age"> = {};
type PersonKeys = keyof Person;
type PersonOnlyName = Pick<Person, "name" | "age">;
type Age = Exclude<PersonKeys, "name">;

// Partial的实现
type Partial<T> = {
  [P in keyof T]?: T[P];
};
