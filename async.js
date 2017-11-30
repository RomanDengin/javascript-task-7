'use strict';

// Хрюндель не хочет идти ко мне :(

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    var results = [];

    // если нет задач или исполнять ничего не хотим, сразу резолвимся с пустым массивом
    return new Promise(resolve => {

        if (jobs.length === 0 || parallelNum <= 0) {
            resolve(results);

            return;
        }

        var countOfExecutedJobs = 0;

        // берём parallelNum заданий и запускаем их параллельно
        var parallelJobs = jobs.slice(0, parallelNum);
        parallelJobs.forEach(job => exec(job, countOfExecutedJobs++));

        // запуск задания
        function exec(job, index) {
            var proc = res => proceedResult(res, index); // из функции двух переменных делаем одну
            // результат тот, что придёт раньше (ответ или timeout)
            Promise.race(
                [
                    job(),
                    new Promise(rejected =>
                        setTimeout(rejected, timeout, new Error('Promise timeout')))
                ]
            )
                // и ошибку и ответ надо заносить в итоговый массив
                .then(proc)
                .catch(proc);
        }
        // если всё сделали, резолвимся, если нет, по-одному выполняем запросы дальше
        function proceedResult(res, index) {
            results[index] = res;
            if (results.length === jobs.length) {
                resolve(results);

                return;
            }

            if (countOfExecutedJobs < jobs.length) {
                exec(jobs[countOfExecutedJobs], countOfExecutedJobs++);
            }
        }
    });
}
