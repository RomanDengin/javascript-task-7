'use strict';

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

    return new Promise(resolve => {

        if (jobs.length === 0 || parallelNum <= 0) {
            resolve(results);

            return;
        }

        var countOfExecutedJobs = 0;

        var anotherPartOfJobs = jobs.slice(0, parallelNum);

        anotherPartOfJobs.forEach(job => exec(job, countOfExecutedJobs++));

        function exec(job, index) {
            var proc = res => proceed(res, index);
            Promise.race(
                [
                    job(),
                    new Promise(rejected => setTimeout(rejected, timeout, new Error('timeouted')))
                ]
            )
                .then(proc)
                .catch(proc);
        }

        function proceed(res, index) {
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
