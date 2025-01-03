import { header, nav, main, footer } from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import axios from 'axios';

const router = new Navigo("/");

function render(state = store.home) {
  document.querySelector("#root").innerHTML = `
      ${header(state)}
      ${nav(store.nav)}
      ${main(state)}
      ${footer()}
    `;
    router.updatePageLinks();
}

render();

router.hooks({
  before: (done, params) => {
    const view = params?.data?.view ? camelCase(params.data.view) : "home";

    switch (view) {
      case "home":
        axios
          .get(
            `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&units=imperial&q=st%20louis`
          )
          .then(response => {
            store.home.weather = {
              city: response.data.name,
              temp: response.data.main.temp,
              feelsLike: response.data.main.feels_like,
              description: response.data.weather[0].main
            };
            done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
        break;
      // Added in Lesson 7.1
      case "pizza":
        axios
          .get(`${process.env.PIZZA_PLACE_API_URL}/pizzas`)
          .then(response => {
            store.pizza.pizzas = response.data;
            done();
          })
          .catch((error) => {
            console.log("It puked", error);
            done();
          });
          break;
      default :
        done();
    }
  },
  already: (params) => {
    const view = params?.data?.view ? camelCase(params.data.view) : "home";

    render(store[view]);
  }
});
  after: (match) => {
    

    router.updatePageLinks();

    document.querySelector(".fa-bars").addEventListener("click", () => {
        document.querySelector("nav > ul").classList.toggle("hidden--mobile");
    });
  }

router
      .on({
        "/": () => render(store.home),
        ":view": (match) => {
          const view = match?.data?.view ? camelCase(match.data.view) : "home";
          if (view in store) {
            render(store[view]);
          } else {
            render(store.viewNotFound);
            console.log(`View ${view} not defined`);
          }
        },
      })
      .resolve();



// add menu toggle to bars icon in nav bar
document.querySelector(".fa-bars").addEventListener("click", () => {
  document.querySelector("nav > ul").classList.toggle("hidden--mobile");
});